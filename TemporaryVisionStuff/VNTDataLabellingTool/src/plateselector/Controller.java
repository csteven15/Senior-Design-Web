package plateselector;

import javafx.beans.value.ChangeListener;
import javafx.beans.value.ObservableValue;
import javafx.embed.swing.SwingFXUtils;
import javafx.event.ActionEvent;
import javafx.event.EventHandler;
import javafx.fxml.FXML;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.ImageView;
import javafx.scene.input.*;
import javafx.scene.layout.AnchorPane;
import javafx.scene.layout.Region;
import org.opencv.calib3d.Calib3d;
import org.opencv.core.*;
import org.opencv.core.Point;
import org.opencv.imgcodecs.Imgcodecs;
import org.opencv.imgproc.Imgproc;
import org.opencv.utils.Converters;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.geom.AffineTransform;
import java.awt.image.BufferedImage;
import java.awt.image.DataBufferByte;
import java.io.*;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;

public class Controller {

    public static final File imgDir = new File("./img");
    public static final File labelDir = new File("./labels");
    public static final File plateDir = new File("./plates");

    @FXML
    AnchorPane anchorPane;

    @FXML
    Label lblImages;

    @FXML
    ListView<String> lstImagesList;
    ArrayList<File> parallelList;
    ArrayList<BufferedImage> parallelListOfImages;
    ImageLabelInformation[] imageLabelInformation;

    @FXML
    Button btnFlipImage;

    @FXML
    Button btnExportAllResults;

    @FXML
    ImageView imgImageView;

    @FXML
    ImageView imgPlateView;

    @FXML
    CheckBox chkIsFloridaPlate;

    @FXML
    CheckBox chkIsNonStandardDesign;

    @FXML
    CheckBox chkIsEdgeInfoObscured;

    @FXML
    CheckBox chkDoesNotContainPlate;

    @FXML
    Button btnLoadInformationFromLabelsfolder;

    @FXML
    TextField txtTag;

    static { System.loadLibrary(Core.NATIVE_LIBRARY_NAME); }

    public void initialize() {
        parallelList = new ArrayList<>();
        parallelListOfImages = new ArrayList<>();

        // Bind width of image view
        imgImageView.fitWidthProperty().bind(anchorPane.widthProperty().subtract(360));
        imgImageView.fitHeightProperty().bind(anchorPane.heightProperty().subtract(150));

        if (!imgDir.exists()) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("No Image Directory");
            Label contentLabel = new Label("To use this tool, you must place your *.jpg images in a directory named " + imgDir.getName() + " in the working directory you are running this from.");
            contentLabel.setWrapText(true);
            alert.getDialogPane().setContent(contentLabel);
            alert.showAndWait();
            System.exit(1);
        }

        System.out.println("Loading images in " + imgDir.getName() + " directory:");
        File[] allFiles = imgDir.listFiles();
        // Sort items for sanity
        Arrays.sort(allFiles, new Comparator<File>() {
            @Override
            public int compare(File o1, File o2) {
                return o1.getAbsolutePath().compareTo(o2.getAbsolutePath());
            }
        });

        if (allFiles.length < 1) {
            Alert alert = new Alert(Alert.AlertType.ERROR);
            alert.setTitle("Empty Image Directory");
            Label contentLabel = new Label("To use this tool, you must place at least one *.jpg image in the directory named " + imgDir.getName() + ".");
            contentLabel.setWrapText(true);
            alert.getDialogPane().setContent(contentLabel);
            alert.showAndWait();
            System.exit(1);
        }

        for (File file : allFiles) {
            System.out.print("Found " + file.getName() + "... ");
            if (file.getName().toLowerCase().endsWith(".jpg")) {
                lstImagesList.getItems().add(file.getName());
                parallelList.add(file);

                // Load image
                try {
                    BufferedImage loadedImage = ImageIO.read(file);
                    parallelListOfImages.add(loadedImage);
                }
                catch (IOException e) {
                    e.printStackTrace();
                    System.exit(1);
                }

                System.out.println("OK!");
            } else {
                System.out.println("Not a JPG image!");
            }
        }
        imageLabelInformation = new ImageLabelInformation[parallelList.size()];
        for (int i = 0; i < imageLabelInformation.length; i++) {
            imageLabelInformation[i] = new ImageLabelInformation();
        }

        lstImagesList.getSelectionModel().selectedIndexProperty().addListener(new ChangeListener<Number>() {
            @Override
            public void changed(ObservableValue<? extends Number> observable, Number oldValue, Number newValue) {
                // Save old values and then load...
                saveCheckboxStates(oldValue.intValue());
                saveTagState(oldValue.intValue());

                showSelectedImage();
            }
        });

        txtTag.textProperty().addListener(new ChangeListener<String>() {
            @Override
            public void changed(ObservableValue<? extends String> observable, String oldValue, String newValue) {
                saveTagState(lstImagesList.getSelectionModel().getSelectedIndex());
            }
        });

        lstImagesList.getSelectionModel().select(0);
    }

    private void saveCheckboxStates(int destinationIndex) {
        if (destinationIndex == -1)
            return;

        imageLabelInformation[destinationIndex].isFloridaPlate = chkIsFloridaPlate.isSelected();
        imageLabelInformation[destinationIndex].isNonStandardDesign = chkIsNonStandardDesign.isSelected();
        imageLabelInformation[destinationIndex].isEdgeInfoObscured = chkIsEdgeInfoObscured.isSelected();
        imageLabelInformation[destinationIndex].doesNotContainPlate = chkDoesNotContainPlate.isSelected();
    }

    private void saveTagState(int destinationIndex) {
        if (destinationIndex == -1)
            return;

        imageLabelInformation[destinationIndex].tag = txtTag.getText();
    }

    private static BufferedImage createRotated(BufferedImage image)
    {
        AffineTransform at = AffineTransform.getRotateInstance(
                Math.PI, image.getWidth()/2.0, image.getHeight()/2.0);
        return createTransformed(image, at);
    }

    private static BufferedImage createTransformed(
            BufferedImage image, AffineTransform at) {
        BufferedImage newImage = new BufferedImage(
                image.getWidth(), image.getHeight(),
                image.getType());
        Graphics2D g = newImage.createGraphics();
        g.transform(at);
        g.drawImage(image, 0, 0, null);
        g.dispose();
        return newImage;
    }

    private static final int plateWidth = 192;
    private static final int plateHeight = 96;
    private BufferedImage getPerspectiveTransformedPlate(int i) {
        List<Point> srcPoints = new ArrayList<Point>();
        srcPoints.add(new Point(imageLabelInformation[i].x[0], imageLabelInformation[i].y[0]));
        srcPoints.add(new Point(imageLabelInformation[i].x[1], imageLabelInformation[i].y[1]));
        srcPoints.add(new Point(imageLabelInformation[i].x[2], imageLabelInformation[i].y[2]));
        srcPoints.add(new Point(imageLabelInformation[i].x[3], imageLabelInformation[i].y[3]));


        BufferedImage srcImage = parallelListOfImages.get(i);

        List<Point> dstPoints = new ArrayList<Point>();
        dstPoints.add(new Point(0, 0));
        dstPoints.add(new Point(plateWidth, 0));
        dstPoints.add(new Point(plateWidth, plateHeight));
        dstPoints.add(new Point(0, plateHeight));


        Mat src = bufferedImageToMat(srcImage);

        Mat homography = Imgproc.getPerspectiveTransform(Converters.vector_Point2f_to_Mat(srcPoints), Converters.vector_Point2f_to_Mat(dstPoints));
        for (int r = 0; r < homography.rows(); r++) {
            for (int c = 0; c < homography.cols(); c++) {
                System.out.print(Arrays.toString(homography.get(r, c)) + " ");
            }
            System.out.println();
        }

        Mat dst = new Mat(plateWidth, plateHeight, CvType.CV_8UC3);


        Imgproc.warpPerspective(src, dst, homography, new Size(plateWidth, plateHeight));



        return mat2Img(dst);
    }

    public static Mat bufferedImageToMat(BufferedImage bi) {
        Mat mat = new Mat(bi.getHeight(), bi.getWidth(), CvType.CV_8UC3);
        byte[] data = ((DataBufferByte) bi.getRaster().getDataBuffer()).getData();
        mat.put(0, 0, data);
        return mat;
    }

    public static BufferedImage mat2Img(Mat in)
    {
        BufferedImage out;
        byte[] data = new byte[in.cols() * in.rows() * (int)in.elemSize()];
        int type;
        in.get(0, 0, data);

        type = BufferedImage.TYPE_3BYTE_BGR;

        out = new BufferedImage(in.cols(), in.rows(), type);

        out.getRaster().setDataElements(0, 0, in.cols(), in.rows(), data);

        // Flip red and blue
        for (int x = 0; x < out.getWidth(); x++)
            for (int y = 0; y < out.getHeight(); y++) {
                int blue = new Color(out.getRGB(x, y)).getRed();
                int green = new Color(out.getRGB(x, y)).getGreen();
                int red = new Color(out.getRGB(x, y)).getBlue();

                out.setRGB(x, y, new Color(red, green, blue).getRGB());
            }

        return out;
    }

    private synchronized void plotPoint(double x, double y) {
        int i = lstImagesList.getSelectionModel().getSelectedIndex();

        //Find next point to be plotted or restart!
        int pointToPlotIndex = imageLabelInformation[i].getNextUnplottedPointOrReset();
        imageLabelInformation[i].x[pointToPlotIndex] = x;
        imageLabelInformation[i].y[pointToPlotIndex] = y;
    }

    private synchronized BufferedImage getImageWithPoints(int i) {
        BufferedImage source = parallelListOfImages.get(i);

        BufferedImage workingImage = new BufferedImage(source.getWidth(), source.getHeight(), source.getType());
        Graphics2D g = workingImage.createGraphics();
        g.drawImage(source, 0, 0, null);

        // Draw points we have placed!
        for (int p = 0; p < imageLabelInformation[i].x.length; p++) {
            if (imageLabelInformation[i].x[p] != -1) {
                // There's a point to be drawn!

                g.setStroke(new BasicStroke(Math.min(source.getWidth(), source.getHeight()) / 250.0f));

                // Set color
                if (p == 0)
                    g.setColor(Color.RED);
                else if (p == 1)
                    g.setColor(Color.GREEN);
                else if (p == 2)
                    g.setColor(Color.BLUE);
                else
                    g.setColor(Color.YELLOW);

                // Draw point
                g.drawOval((int)imageLabelInformation[i].x[p]-4, (int)imageLabelInformation[i].y[p]-4, 8, 8);
            }
        }

        if (imageLabelInformation[i].allPointsPlotted()) {
            // Draw bounding box
            g.setColor(Color.CYAN);
            g.setStroke(new BasicStroke(Math.min(source.getWidth(), source.getHeight()) / 250.0f));
            g.drawRect((int) imageLabelInformation[i].getBoundingBoxTopLeftX(), (int) imageLabelInformation[i].getBoundingBoxTopLeftY(), (int) imageLabelInformation[i].getWidth(), (int) imageLabelInformation[i].getHeight());
        }

        g.dispose();
        return workingImage;
    }

    private void showSelectedImage() {
        int i = lstImagesList.getSelectionModel().getSelectedIndex();
        lblImages.setText("Images (" + i + " of " + (parallelList.size()-1) + "):");
        System.out.println("Show image " + i + "; " + System.lineSeparator() + imageLabelInformation[i]);
        imgImageView.setImage(SwingFXUtils.toFXImage(getImageWithPoints(i), null));
        if (imageLabelInformation[i].allPointsPlotted())
            imgPlateView.setImage(SwingFXUtils.toFXImage(getPerspectiveTransformedPlate(i), null));
        else
            imgPlateView.setImage(null);
        if (imageLabelInformation[i] != null) {
            chkIsFloridaPlate.setSelected(imageLabelInformation[i].isFloridaPlate);
            chkIsNonStandardDesign.setSelected(imageLabelInformation[i].isNonStandardDesign);
            chkIsEdgeInfoObscured.setSelected(imageLabelInformation[i].isEdgeInfoObscured);
            chkDoesNotContainPlate.setSelected(imageLabelInformation[i].doesNotContainPlate);
            txtTag.setText(imageLabelInformation[i].tag);
        } else {
            chkIsFloridaPlate.setSelected(false);
            chkIsNonStandardDesign.setSelected(false);
            chkIsEdgeInfoObscured.setSelected(false);
            chkDoesNotContainPlate.setSelected(false);
        }
    }

    private void flipTheImage(int i) throws IOException {
        parallelListOfImages.set(i, createRotated(parallelListOfImages.get(i)));

        // Also actually overwrite the original image!
        ImageIO.write(parallelListOfImages.get(i), "jpeg", parallelList.get(i));

        showSelectedImage();
    }

    public void attachKeyboardShortcuts(Scene scene) {
        scene.addEventFilter(KeyEvent.KEY_PRESSED, new EventHandler<KeyEvent>() {
            @Override
            public void handle(KeyEvent event) {
                if (event.getCode() == KeyCode.ENTER) {
                    if (txtTag.isFocused()) {
                        lstImagesList.requestFocus();
                        event.consume();
                    } else {
                        txtTag.requestFocus();
                    }
                }

                if (txtTag.isFocused())
                    return;


                if (event.getCode() == KeyCode.F) {
                    try {
                        onClickFlipImage(null);
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }

                if (event.getCode() == KeyCode.RIGHT || event.getCode() == KeyCode.D) {
                    int newIndex = lstImagesList.getSelectionModel().getSelectedIndex() + 1;
                    if (newIndex >= 0 && newIndex < parallelList.size()) {
                        lstImagesList.getSelectionModel().select(newIndex);
                    }
                }

                if (event.getCode() == KeyCode.LEFT || event.getCode() == KeyCode.A) {
                    int newIndex = lstImagesList.getSelectionModel().getSelectedIndex() - 1;
                    if (newIndex >= 0 && newIndex < parallelList.size()) {
                        lstImagesList.getSelectionModel().select(newIndex);
                    }
                }

                if (event.getCode() == KeyCode.DIGIT1) {
                    chkIsFloridaPlate.setSelected(!chkIsFloridaPlate.isSelected());
                    onCheckboxClicked(null);
                }

                if (event.getCode() == KeyCode.DIGIT2) {
                    chkIsNonStandardDesign.setSelected(!chkIsNonStandardDesign.isSelected());
                    onCheckboxClicked(null);
                }

                if (event.getCode() == KeyCode.DIGIT3) {
                    chkIsEdgeInfoObscured.setSelected(!chkIsEdgeInfoObscured.isSelected());
                    onCheckboxClicked(null);
                }

                if (event.getCode() == KeyCode.DIGIT4) {
                    chkDoesNotContainPlate.setSelected(!chkDoesNotContainPlate.isSelected());
                    onCheckboxClicked(null);
                }
            }
        });
    }

    @FXML
    public void mousePressed(MouseEvent event) {
        double xInImage = (event.getX()/imgImageView.boundsInParentProperty().get().getWidth()) * imgImageView.getImage().getWidth();
        double yInImage = (event.getY()/imgImageView.boundsInParentProperty().get().getHeight()) * imgImageView.getImage().getHeight();
        plotPoint(xInImage, yInImage);
        showSelectedImage();
    }

    @FXML
    public void mouseDragUpdate(MouseEvent event) {
        double xInImage = (event.getX()/imgImageView.boundsInParentProperty().get().getWidth()) * imgImageView.getImage().getWidth();
        double yInImage = (event.getY()/imgImageView.boundsInParentProperty().get().getHeight()) * imgImageView.getImage().getHeight();
    }

    @FXML
    public void mouseReleased(MouseEvent event) {
        double xInImage = (event.getX()/imgImageView.boundsInParentProperty().get().getWidth()) * imgImageView.getImage().getWidth();
        double yInImage = (event.getY()/imgImageView.boundsInParentProperty().get().getHeight()) * imgImageView.getImage().getHeight();
    }

    @FXML
    public void onClickExportAllResults(ActionEvent event) throws IOException {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION, "Are you CERTAIN you want to EXPORT ALL RESULTS? This will overwrite ALL LABEL DATA SAVED ON DISK with the information currently loaded into the program.", ButtonType.YES, ButtonType.CANCEL);
        alert.getDialogPane().setMinHeight(Region.USE_PREF_SIZE);
        alert.showAndWait();

        if (alert.getResult() != ButtonType.YES) {
            System.out.println("Export was cancelled by the user.");
            return;
        }

        btnExportAllResults.setDisable(true);
        System.out.println("Exporting...");

        // Make sure output directories exist!
        labelDir.mkdirs();
        plateDir.mkdirs();

        for (int i = 0; i < parallelList.size(); i++) {
            System.out.println("Exporting (" + (i+1) + "/" + parallelList.size() + ")...");

            if (imageLabelInformation[i] != null) {
                // Good data for this index to export!
                File outputTextFile = new File( labelDir.getAbsolutePath() + "/" + lstImagesList.getItems().get(i) + ".txt");
                PrintWriter pw = new PrintWriter(outputTextFile);
                pw.println(imageLabelInformation[i].toString());
                pw.flush();
                pw.close();

                // If there was a rectangle selected then export the subimage
                if (imageLabelInformation[i].allPointsPlotted()) {
                    File outputImage = new File(plateDir.getAbsolutePath() + "/" + lstImagesList.getItems().get(i));
                    BufferedImage plateSubImage = parallelListOfImages.get(i).getSubimage((int) imageLabelInformation[i].getBoundingBoxTopLeftX(), (int) imageLabelInformation[i].getBoundingBoxTopLeftY(), (int) imageLabelInformation[i].getWidth(), (int) imageLabelInformation[i].getHeight());
                    ImageIO.write(plateSubImage, "jpeg", outputImage);
                }


            }
        }

        btnExportAllResults.setDisable(false);
    }

    @FXML
    public void onClickFlipImage(ActionEvent event) throws IOException {
        int i = lstImagesList.getSelectionModel().getSelectedIndex();
        flipTheImage(i);
    }

    @FXML
    public void onCheckboxClicked(MouseEvent event) {
        saveCheckboxStates(lstImagesList.getSelectionModel().getSelectedIndex());
    }

    @FXML
    private void onClickLoadInformationFromLabels(ActionEvent event) throws FileNotFoundException {
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION, "Are you CERTAIN you want to LOAD INFO FROM DISK? This will overwrite ALL LABEL DATA currently loaded in the program with the label information that is on disk.", ButtonType.YES, ButtonType.CANCEL);
        alert.getDialogPane().setMinHeight(Region.USE_PREF_SIZE);
        alert.showAndWait();

        if (alert.getResult() != ButtonType.YES) {
            System.out.println("Load was cancelled by the user.");
            return;
        }

        for (int i = 0; i < parallelList.size(); i++) {
            File originalFile = parallelList.get(i);
            File correspondingLabelFile = new File(labelDir.getAbsolutePath() + "/" + originalFile.getName() + ".txt");
            if (correspondingLabelFile.exists()) {
                ImageLabelInformation loaded = ImageLabelInformation.loadLabelFromFile(correspondingLabelFile);

                imageLabelInformation[i] = loaded;
            }
        }

        showSelectedImage();
    }
}
