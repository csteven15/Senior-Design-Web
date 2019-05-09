package com.example.philip.devdriverandroidapplication;

import android.app.Application;
import android.content.Context;

import com.amazonaws.mobileconnectors.cognitoidentityprovider.CognitoUserPool;
import com.amazonaws.regions.Regions;

public class ApplicationClass extends Application {

    @Override
    public void onCreate() {
        super.onCreate();
        System.out.println("The application class has been created!");
    }
}
