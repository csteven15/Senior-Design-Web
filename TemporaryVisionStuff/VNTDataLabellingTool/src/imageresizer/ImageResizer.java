package imageresizer;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.Scanner;

public class ImageResizer {
    public static Scanner scan = new Scanner(System.in);

    public static void main(String[] args) throws IOException {
        System.out.println("This software is simple. It takes every jpg file in the working directory you ran the software from and scales or updates the width and height. It replaces the images as it goes.");
        System.out.println();
        System.out.println();

        while (true) {
            System.out.println("~Main Menu~");
            System.out.println("Do you want to scale the image width and height by a scalar or explicitly stretch the images to a width and height?");
            System.out.println("1 - Scale the image width and height by a scalar");
            System.out.println("2 - Stretch the images to a specific width and height");
            System.out.println("3 - Center-cut (crop) to a specific width and height");
            int choice = getMenuChoice();

            if (choice == 1) {
                scaleMenu();
            } else if (choice == 2) {
                stretchMenu();
            } else if (choice == 3) {
                cropMenu();
            } else {
                System.out.println("Invalid input!");
            }
        }
    }

    private static int getMenuChoice() {
        String choice = scan.next();
        try {
            int intChoice = Integer.parseInt(choice);
            return intChoice;
        } catch (Exception exc) {
            return -1;
        }
    }

    private static void scaleMenu() throws IOException {
        System.out.println("~Scale Menu~");
        System.out.println("Enter an amount in which to scale the images by (e.g. 0.25 to scale width by 0.25x and height by 0.25x):");
        double scale = scan.nextDouble();

        File[] allFiles = new File("./").listFiles();
        for (File file : allFiles) {
            if (file.getName().toLowerCase().endsWith(".jpg")) {
                System.out.println("Resizing " + file.getName());
                BufferedImage original = ImageIO.read(file);
                ImageIO.write(getResizedImage(original, (int)(original.getWidth()*scale), (int)(original.getHeight()*scale)), "jpeg", new File(file.getName()));
            } else {
                System.out.println("Ignoring non *.jpg " + file.getName());
            }
        }
    }

    private static void stretchMenu() throws IOException {
        System.out.println("~Stretch Menu~");
        System.out.println("Enter the desired resulting image width: ");
        int desiredWidth = scan.nextInt();
        System.out.println("Enter the desired resulting image height: ");
        int desiredHeight = scan.nextInt();

        File[] allFiles = new File("./").listFiles();
        for (File file : allFiles) {
            if (file.getName().toLowerCase().endsWith(".jpg")) {
                System.out.println("Resizing " + file.getName());
                BufferedImage original = ImageIO.read(file);
                ImageIO.write(getResizedImage(original, desiredWidth, desiredHeight), "jpeg", new File(file.getName()));
            } else {
                System.out.println("Ignoring non *.jpg " + file.getName());
            }
        }
    }

    private static void cropMenu() throws IOException {
        System.out.println("~Crop Menu~");
        System.out.println("Enter the desired resulting image width: ");
        int desiredWidth = scan.nextInt();
        System.out.println("Enter the desired resulting image height: ");
        int desiredHeight = scan.nextInt();

        File[] allFiles = new File("./").listFiles();
        for (File file : allFiles) {
            if (file.getName().toLowerCase().endsWith(".jpg")) {
                System.out.println("Resizing " + file.getName());
                BufferedImage original = ImageIO.read(file);
                BufferedImage result = getCenterCroppedImage(original, desiredWidth, desiredHeight);
                if (result == null) {
                    System.out.println("Failed for " + file.getName() + "!");
                    continue;
                }
                ImageIO.write(result, "jpeg", new File(file.getName()));
            } else {
                System.out.println("Ignoring non *.jpg " + file.getName());
            }
        }
    }

    public static BufferedImage getResizedImage(BufferedImage img, int newW, int newH) {
        java.awt.Image tmp = img.getScaledInstance(newW, newH, java.awt.Image.SCALE_SMOOTH);
        BufferedImage dimg = new BufferedImage(newW, newH, img.getType());

        Graphics2D g2d = dimg.createGraphics();
        g2d.drawImage(tmp, 0, 0, null);
        g2d.dispose();

        return dimg;
    }

    public static BufferedImage getCenterCroppedImage(BufferedImage img, int newW, int newH) {
        int offsetX = (img.getWidth()-newW)/2;
        int offsetY = (img.getHeight()-newH)/2;

        if (offsetX < 0 || offsetY < 0) {
            System.out.println("Cannot crop to a size greater than the original image!");
            return null;
        }

        return img.getSubimage(offsetX, offsetY, newW, newH);
    }
}
