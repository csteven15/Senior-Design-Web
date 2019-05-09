package com.example.philip.devdriverandroidapplication;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoDevice;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserSession;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.AuthenticationContinuation;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.AuthenticationDetails;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.ChallengeContinuation;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.continuations.MultiFactorAuthenticationContinuation;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.AuthenticationHandler;

public class MainActivity extends Activity {

    private BackendDriver backendDriver = new BackendDriver(this);

    private EditText edtUsername;
    private EditText edtPassword;
    private Button btnLogin;
    private Button btnCreateAccount;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initComponents();
    }

    private void initComponents() {
        edtUsername = findViewById(R.id.edtUsername);
        edtPassword = findViewById(R.id.edtPassword);
        btnLogin = findViewById(R.id.btnLogin);
        btnCreateAccount = findViewById(R.id.btnCreateAccount);

        btnLogin.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String usernameToUse = edtUsername.getText().toString();
                if (usernameToUse.length() < 1)
                    usernameToUse = backendDriver.getLastUsedUsername();

                backendDriver.authenticateUser(usernameToUse, edtPassword.getText().toString(), new BackendDriver.OnAuthenticationResultHandler() {
                    @Override
                    public void onAuthenticationSuccess(CognitoUserSession cognitoUserSession) {
                        Toast.makeText(MainActivity.this, "Successful authentication. :)", Toast.LENGTH_LONG).show();

                        Intent intent = new Intent(MainActivity.this, LoggedInActivity.class);
                        startActivity(intent);
                    }

                    @Override
                    public void onAuthenticationFailure(Exception exception) {

                        Toast.makeText(MainActivity.this, "Authentication failed!", Toast.LENGTH_LONG).show();
                    }
                });
            }
        });

        btnCreateAccount.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                Intent intent = new Intent(MainActivity.this, CreateAccountActivity.class);
                startActivity(intent);
            }
        });
    }
}
