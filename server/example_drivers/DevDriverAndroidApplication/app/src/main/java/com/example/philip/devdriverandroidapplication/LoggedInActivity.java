package com.example.philip.devdriverandroidapplication;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.Response;
import com.android.volley.VolleyError;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.concurrent.atomic.AtomicInteger;

public class LoggedInActivity extends Activity {

    private BackendDriver backendDriver = new BackendDriver(this);

    TextView txtLoggedInMessage;
    TextView txtResponseText;
    Button btnSendInitializeUserRequest;
    Button btnSendGetUserRequest;
    Button btnSendGetFieldRequest;
    Button btnSendAddCarRequest;
    Button btnSendGetCarsRequest;
    Button btnStressTest1;
    Button btnLogout;

    Response.ErrorListener errorListener = new Response.ErrorListener() {
        @Override
        public void onErrorResponse(VolleyError error) {
            try {
                if (error == null || error.networkResponse == null)
                    setResponseText("Error response: " + error.toString());
                else
                    setResponseText("Error response of type " + error.toString() + ":\n" + new String(error.networkResponse.data, "UTF-8"));
            } catch (UnsupportedEncodingException e) {
                e.printStackTrace();
            }
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_logged_in);

        initComponents();
    }

    private void setResponseText(String text) {
        txtResponseText.setText(new Date().toString() + " ~ " + text);
    }

    private void initComponents() {
        txtLoggedInMessage = findViewById(R.id.txtLoggedInMessage);
        txtResponseText = findViewById(R.id.txtResponseText);
        btnSendInitializeUserRequest = findViewById(R.id.btnSendInitializeUserRequest);
        btnSendGetUserRequest = findViewById(R.id.btnSendGetUserRequest);
        btnSendGetFieldRequest = findViewById(R.id.btnSendGetFieldRequest);
        btnSendAddCarRequest = findViewById(R.id.btnSendAddCarRequest);
        btnSendGetCarsRequest = findViewById(R.id.btnSendGetCarsRequest);
        btnStressTest1 = findViewById(R.id.btnStressTest1);
        btnLogout = findViewById(R.id.btnLogout);

        btnSendInitializeUserRequest.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    JSONObject body = new JSONObject();
                    body.put("username", "testuser50");
                    body.put("password", "testpass123");
                    body.put("firstName", "Bob");
                    body.put("lastName", "Smith");
                    body.put("emailAddress", "bobsmith@gmail.com");
                    body.put("phoneNumber", "4071234567");
                    body.put("streetAddress", "142 Wisteria Lane");
                    body.put("city", "Ocala");
                    body.put("state", "Florida");
                    body.put("zipCode", "32756");
                    body.put("accountLevel", 200);

                    backendDriver.sendRequest(Request.Method.POST, "/api/users/initializeNewUser", body, new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            setResponseText("Successful response:\n" + response.toString());
                        }
                    }, errorListener);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

        btnSendGetUserRequest.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                backendDriver.sendRequest(Request.Method.GET, "/api/users/testuser50", null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        setResponseText("Successful fetching of user data! " + response.toString());
                    }
                }, errorListener);
            }
        });

        btnSendGetFieldRequest.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                backendDriver.sendRequest(Request.Method.GET, "/api/users/testuser50/firstName", null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        setResponseText("Successful fetching of user field! " + response.toString());
                    }
                }, errorListener);
            }
        });

        btnSendAddCarRequest.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                try {
                    JSONObject jsonObject = new JSONObject();
                    jsonObject.put("owner", "testuser50");
                    jsonObject.put("tag", "abcd123");
                    jsonObject.put("state", "Georgia");
                    jsonObject.put("make", "Toyota");
                    jsonObject.put("model", "Camry");
                    jsonObject.put("year", "2010");
                    jsonObject.put("color", "Black");

                    backendDriver.sendRequest(Request.Method.POST, "/api/cars/addCar", jsonObject, new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            setResponseText("Successfully added car: " + response.toString());
                        }
                    }, errorListener);
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
        });

        btnSendGetCarsRequest.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                backendDriver.sendRequest(Request.Method.GET, "/api/cars/testuser50", null, new Response.Listener<JSONObject>() {
                    @Override
                    public void onResponse(JSONObject response) {
                        setResponseText("Successfully fetched cars: " + response.toString());
                    }
                }, errorListener);
            }
        });

        btnLogout.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                System.out.println("Logging out...");
                backendDriver.signOut();
                LoggedInActivity.this.finish();
            }
        });

        btnStressTest1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {

                final AtomicInteger atomicInteger = new AtomicInteger(0);
                final long startTime = System.currentTimeMillis();
                final int numResponsesExpected = 1000;

                System.out.println("Performing stress test!");
                for (int i = 0; i < numResponsesExpected; i++) {
                    backendDriver.sendRequest(Request.Method.GET, "/api/users/testuser50", null, new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            checkTestFinished(atomicInteger, startTime, numResponsesExpected);
                            setResponseText("Successful response:\n" + response.toString());
                        }
                    }, new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            errorListener.onErrorResponse(error);
                            checkTestFinished(atomicInteger, startTime, numResponsesExpected);
                        }
                    });
                }
            }
        });
    }

    public void checkTestFinished(AtomicInteger atomicInteger, long startTime, int numResponsesExpected) {
        int val = atomicInteger.incrementAndGet();
        System.out.println("Response " + val);
        if (val >= numResponsesExpected) {
            long endTime = System.currentTimeMillis();
            System.out.println("Got all " + numResponsesExpected + " responses in " + (endTime-startTime) + "ms.");
            setResponseText("Got all " + numResponsesExpected + " responses in " + (endTime-startTime) + "ms.");
        }
    }
}
