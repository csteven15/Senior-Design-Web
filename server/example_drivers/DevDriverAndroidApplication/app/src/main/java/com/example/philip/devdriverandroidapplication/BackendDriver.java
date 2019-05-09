package com.example.philip.devdriverandroidapplication;

import android.content.Context;
import android.content.SharedPreferences;

import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoDevice;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserPool;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserSession;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.AuthenticationContinuation;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.AuthenticationDetails;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.ChallengeContinuation;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.MultiFactorAuthenticationContinuation;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.AuthenticationHandler;
import com.amazonaws.regions.Regions;
import com.android.volley.AuthFailureError;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.BasicNetwork;
import com.android.volley.toolbox.DiskBasedCache;
import com.android.volley.toolbox.HurlStack;
import com.android.volley.toolbox.JsonObjectRequest;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * This class should be used to help communicate with the abstract Virtually No Tag backend. It
 * contains methods for interacting both with Amazon Cognito and for sending requests off to the
 * backend using Volley.
 *
 * The expected use of this class is that there should be at most one instance of this class as a
 * member variable per activity class. Alternately, you could create one instance application-wide
 * via the Application class (the class that extends Application).
 *
 * The class is marked final because it should not be extended.
 *
 * @author Philip Rodriguez
 */
public final class BackendDriver {
    private static final String AmazonCognitoUserPoolID = "us-east-2_wKfl4Jx2m";
    private static final String AmazonCognitoClientID = "5bb92qbdcalogljeg1onfig9dg";
    private static final Regions AmazonCognitoRegion = Regions.US_EAST_2;
    private static final String SharedPreferencesFileKey = "vnt_backend_driver";

    private static final String ExpressURL = "http://192.168.1.123:8080";

    // The context for this BackendDriver instance.
    private final Context context;

    // The "connection" to the Amazon Cognito service.
    private CognitoUserPool cognitoUserPool;

    // The "connection" to the Express backend API.
    private static volatile RequestQueue requestQueue;

    // This object exists to be locked onto before re-assignment of the requestQueue member. While
    // the Volley API is itself thread-safe, the requestQueue could still be double-assigned in
    // prepareRequestQueue without this lock.
    private static final Object requestQueueLock = new Object();

    public BackendDriver(Context context) {
        this.context = context;
    }

    /**
     * This method returns the CognitoUserPool object that refers to the Virtually No Tag user pool.
     *
     * @return A valid CognitoUserPool object.
     */
    public synchronized CognitoUserPool getCognitoUserPool() {
        if (this.cognitoUserPool == null) {
            this.cognitoUserPool = new CognitoUserPool(context.getApplicationContext(), AmazonCognitoUserPoolID, AmazonCognitoClientID, null, AmazonCognitoRegion);
        }
        return this.cognitoUserPool;
    }

    /**
     * This method simply prepares the request queue. This only creates a new queue if one did not
     * already exist.
     */
    private void prepareRequestQueue() {
        synchronized (requestQueueLock) {
            if (requestQueue == null) {
                //requestQueue = Volley.newRequestQueue(context.getApplicationContext());
                requestQueue = new RequestQueue(new DiskBasedCache(context.getCacheDir()), new BasicNetwork(new HurlStack()), 32);
                requestQueue.start();
            }
        }
    }

    private synchronized void setLastUsedUsername(String lastUsedUsername) {
        SharedPreferences sharedPreferences = context.getSharedPreferences(SharedPreferencesFileKey, Context.MODE_PRIVATE);
        sharedPreferences.edit().putString("lastUsedUsername", lastUsedUsername).apply();
    }

    /**
     * This method fetches the username of the last successfully signed-in user, which also counts
     * in most cases as the currently signed-in user. Returns null if no user was ever successfully
     * signed in before.
     *
     * @return A String with the username of the last successfully signed-in user, or null.
     */
    public synchronized String getLastUsedUsername() {
        SharedPreferences sharedPreferences = context.getSharedPreferences(SharedPreferencesFileKey, Context.MODE_PRIVATE);
        return sharedPreferences.getString("lastUsedUsername", null);
    }

    /**
     * This method handles all the nuts and bolts required to send a request. It first uses the
     * Cognito user pool to fetch the current user's session token. Then, it crafts and sends the
     * request using Volley.
     *
     * @param method A member of Request.Method.* representing the method of the request (e.g. GET
     *               or POST)
     * @param jsonObject Represents the object being sent, if any, to the server.
     * @param responseListener Represents a callback method that occurs on response from the server.
     * @param errorListener Represents a callback method that occurs on failure.
     */
    public synchronized void sendRequest(final int method, final String relativeEndpointPath, final JSONObject jsonObject, final Response.Listener<JSONObject> responseListener, final Response.ErrorListener errorListener) {
        if (getLastUsedUsername() != null) {
            getCognitoUserPool().getUser(getLastUsedUsername()).getSessionInBackground(new AuthenticationHandler() {
                @Override
                public void onSuccess(final CognitoUserSession userSession, CognitoDevice newDevice) {
                    // Ensure RequestQueue is up and running.
                    prepareRequestQueue();

                    // Create the request
                    JsonObjectRequest jsonObjectRequest = new JsonObjectRequest(method, ExpressURL + relativeEndpointPath, jsonObject, responseListener, errorListener){
                        @Override
                        public Map<String, String> getHeaders() throws AuthFailureError {
                            HashMap<String, String> headers = new HashMap<>();
                            headers.put("Authorization", "Bearer " + userSession.getAccessToken().getJWTToken());
                            return headers;
                        }
                    };

                    // Send (more accurately, enqueue) the request.
                    requestQueue.add(jsonObjectRequest);
                }

                @Override
                public void getAuthenticationDetails(AuthenticationContinuation authenticationContinuation, String userId) {
                    errorListener.onErrorResponse(new VolleyError("The Cognito service issued a request for more authentication details. Please authenticate the user!"));
                }

                @Override
                public void getMFACode(MultiFactorAuthenticationContinuation continuation) {
                    errorListener.onErrorResponse(new VolleyError("The Cognito service issued a request for MFA details."));
                }

                @Override
                public void authenticationChallenge(ChallengeContinuation continuation) {
                    errorListener.onErrorResponse(new VolleyError("The Cognito service issued a request for an authentication challenge."));
                }

                @Override
                public void onFailure(Exception exception) {
                    errorListener.onErrorResponse(new VolleyError("The Cognito service issued a generic error: " + exception));
                }
            });
        } else {
            errorListener.onErrorResponse(new VolleyError("There is no user currently or recently authenticated."));
        }
    }

    /**
     * This method consults Amazon Cognito using the provided credentials and signs the user in.
     *
     * @param username The user's username.
     * @param password The user's password.
     * @param authListener A callback on authentication result (success or failure).
     */
    public synchronized void authenticateUser(final String username, final String password, final OnAuthenticationResultHandler authListener) {
        getCognitoUserPool().getUser(username).getSessionInBackground(new AuthenticationHandler() {
            @Override
            public void onSuccess(CognitoUserSession userSession, CognitoDevice newDevice) {
                setLastUsedUsername(username);
                authListener.onAuthenticationSuccess(userSession);
            }

            @Override
            public void getAuthenticationDetails(AuthenticationContinuation authenticationContinuation, String userId) {
                AuthenticationDetails authenticationDetails = new AuthenticationDetails(userId, password, null);
                authenticationContinuation.setAuthenticationDetails(authenticationDetails);
                authenticationContinuation.continueTask();
            }

            @Override
            public void getMFACode(MultiFactorAuthenticationContinuation continuation) {
                authListener.onAuthenticationFailure(new Exception("The Cognito service issued a request for MFA details."));
            }

            @Override
            public void authenticationChallenge(ChallengeContinuation continuation) {
                authListener.onAuthenticationFailure(new Exception("The Cognito service issued a request for an authentication challenge."));
            }

            @Override
            public void onFailure(Exception exception) {
                authListener.onAuthenticationFailure(exception);
            }
        });
    }

    /**
     * This method simply signs out the currently signed-in user if one exists.
     */
    public synchronized void signOut() {
        if (getLastUsedUsername() != null) {
            getCognitoUserPool().getUser(getLastUsedUsername()).signOut();
        }
    }

    public interface OnAuthenticationResultHandler {
        void onAuthenticationSuccess(CognitoUserSession cognitoUserSession);
        void onAuthenticationFailure(Exception exception);
    }
}
