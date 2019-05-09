package plateselector;

import java.io.File;
import java.io.FileNotFoundException;
import java.util.Arrays;
import java.util.Scanner;

public class ImageLabelInformation {
    // Rectangle point information. 0 = Top Left, 1 = Top Right, 2 = Bottom Right, 3 = Bottom Left
    public final double[] x;
    public final double[] y;


    public boolean isFloridaPlate;
    public boolean isNonStandardDesign;
    public boolean isEdgeInfoObscured;
    public boolean doesNotContainPlate;

    public String tag;

    public ImageLabelInformation() {
        x = new double[4];
        y = new double[4];
        Arrays.fill(x, -1);
        Arrays.fill(y, -1);
        this.tag = "";
    }

    public boolean allPointsPlotted() {
        for (int i = 0; i < x.length; i++) {
            if (x[i] == -1 || y[i] == -1) {
                return false;
            }
        }
        return true;
    }

    public double getBoundingBoxTopLeftX() {
        double leftmostX = Math.min(x[0], x[3]);

        return leftmostX;
    }

    public double getBoundingBoxTopLeftY() {
        double highestY = Math.min(y[0], y[1]);

        return highestY;
    }

    public double getBoundingBoxBottomRightX() {
        double rightmostX = Math.max(x[1], x[2]);

        return rightmostX;
    }

    public double getBoundingBoxBottomRightY() {
        double lowestY = Math.max(y[2], y[3]);

        return lowestY;
    }

    // Returns the index of the next unplotted point. If all points plotted, unplots all points and returns 0.
    public int getNextUnplottedPointOrReset() {
        for (int i = 0; i < x.length; i++) {
            if (x[i] == -1 || y[i] == -1) {
                return i;
            }
        }

        // We need to reset!
        Arrays.fill(x, -1);
        Arrays.fill(y, -1);
        return 0;
    }

    public double getWidth() {
        return Math.abs(getBoundingBoxBottomRightX()-getBoundingBoxTopLeftX());
    }

    public double getHeight() {
        return Math.abs(getBoundingBoxBottomRightY()-getBoundingBoxTopLeftY());
    }

    public String toString() {
        StringBuilder outputText = new StringBuilder();

        for (int i = 0; i < x.length; i++) {
            outputText.append("x");
            outputText.append(i);
            outputText.append(": ");
            outputText.append(x[i]);
            outputText.append(System.lineSeparator());
            outputText.append("y");
            outputText.append(i);
            outputText.append(": ");
            outputText.append(y[i]);
            outputText.append(System.lineSeparator());
        }

        outputText.append("tag: ");
        outputText.append(tag);
        outputText.append(System.lineSeparator());
        outputText.append("isFloridaPlate: ");
        outputText.append(isFloridaPlate);
        outputText.append(System.lineSeparator());
        outputText.append("isNonStandardDesign: ");
        outputText.append(isNonStandardDesign);
        outputText.append(System.lineSeparator());
        outputText.append("isEdgeInfoObscured: ");
        outputText.append(isEdgeInfoObscured);
        outputText.append(System.lineSeparator());
        outputText.append("doesNotContainPlate: ");
        outputText.append(doesNotContainPlate);
        return outputText.toString();
    }

    public static ImageLabelInformation loadLabelFromFile(File f) throws FileNotFoundException {
        Scanner scan = new Scanner(f);
        ImageLabelInformation imageLabelInformation = new ImageLabelInformation();

        for (int i = 0; i < imageLabelInformation.x.length; i++) {
            imageLabelInformation.x[i] = Double.parseDouble(scan.nextLine().substring(4));
            imageLabelInformation.y[i] = Double.parseDouble(scan.nextLine().substring(4));
        }

        imageLabelInformation.tag = scan.nextLine().substring(5);
        imageLabelInformation.isFloridaPlate = Boolean.parseBoolean(scan.nextLine().substring(16));
        imageLabelInformation.isNonStandardDesign = Boolean.parseBoolean(scan.nextLine().substring(21));
        imageLabelInformation.isEdgeInfoObscured = Boolean.parseBoolean(scan.nextLine().substring(20));
        if (scan.hasNextLine())
            imageLabelInformation.doesNotContainPlate = Boolean.parseBoolean(scan.nextLine().substring(21));
        else
            imageLabelInformation.doesNotContainPlate = false; // Assume false on old data set!
        return imageLabelInformation;
    }
}
