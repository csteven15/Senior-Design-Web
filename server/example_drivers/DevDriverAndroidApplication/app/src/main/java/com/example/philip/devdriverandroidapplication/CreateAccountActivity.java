package com.example.philip.devdriverandroidapplication;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUser;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserAttributes;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserCodeDeliveryDetails;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserPool;
import com.amazonaws.mobileconnectors.cognitoidentityprovider.handlers.SignUpHandler;

public class CreateAccountActivity extends Activity {

    private BackendDriver backendDriver = new BackendDriver(this);

    EditText edtUsername;
    EditText edtPassword;
    EditText edtEmail;
    Button btnCreateAccount;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_create_account);

        initComponents();
    }

    private void initComponents() {
        edtUsername = findViewById(R.id.edtUsername_CreateAccount);
        edtPassword = findViewById(R.id.edtPassword_CreateAccount);
        edtEmail = findViewById(R.id.edtEmail_CreateAccount);
        btnCreateAccount = findViewById(R.id.btnCreateAccount_CreateAccount);

        btnCreateAccount.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                CognitoUserAttributes cognitoUserAttributes = new CognitoUserAttributes();
                cognitoUserAttributes.addAttribute("email", edtEmail.getText().toString());

                backendDriver.getCognitoUserPool().signUpInBackground(edtUsername.getText().toString(), edtPassword.getText().toString(), cognitoUserAttributes, null, new SignUpHandler() {
                    @Override
                    public void onSuccess(CognitoUser user, boolean signUpConfirmationState, CognitoUserCodeDeliveryDetails cognitoUserCodeDeliveryDetails) {
                        Toast.makeText(CreateAccountActivity.this, "Signed up successfully!", Toast.LENGTH_LONG).show();
                        System.out.println("Signed-up user is " + user);
                        System.out.println("Signup confirmation state is " + signUpConfirmationState);
                        System.out.println("Cognito user code delivery details is " + cognitoUserCodeDeliveryDetails);
                    }

                    @Override
                    public void onFailure(Exception exception) {
                        Toast.makeText(CreateAccountActivity.this, "Failed to sign up!", Toast.LENGTH_LONG).show();
                        System.out.println("Failed to sign up with message: " + exception);

                    }
                });
            }
        });
    }
}
