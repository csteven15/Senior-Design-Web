package plateselector;

import javafx.application.Application;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;

public class Main extends Application {
    @Override
    public void start(Stage primaryStage) throws Exception{
        FXMLLoader loader = new FXMLLoader(getClass().getResource("gui.fxml"));
        Parent root = loader.load();
        Controller controller = (Controller)loader.getController();
        primaryStage.setTitle("Plate Selector");
        primaryStage.setScene(new Scene(root, -1, -1));
        primaryStage.show();

        // Do things!
        controller.attachKeyboardShortcuts(root.getScene());
    }


    public static void main(String[] args) {
        launch(args);
    }
}
