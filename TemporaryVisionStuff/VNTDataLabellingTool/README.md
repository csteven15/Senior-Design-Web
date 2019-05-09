# Virtually No Tag Data Labeling Tool
#### By Philip, so complain to Philip for issues :)

## Purpose
This project is a set of tools written in Java with the goal of significantly
speeding up the data processing and data labeling speed for our this project.

## Plate Selector Tool (PlateSelector.jar)

### Purpose
This is a tool to draw rectangles (plot corner points actually) around plates of images in bulk quickly, and check some information about the images such as if the plate is a Florida plate, a standard issue design Florida plate, and if the edges are obscured. This tool can be almost 100% operated with the keyboard except for rectangle drawing and clicking load or export! See hotkeys section to go FAST :)!

### Usage
1. Put the PlateSelector.jar file in a directory
2. In the same directory as you placed the jar, create a directory named "img"
3. Open a terminal and navigate it to the directory you placed the jar in
4. Execute "java -Djava.library.path="/path/to/opencv/lib/lib" -jar -Xmx8G PlateSelector.jar"
5. Use the list on the left OR the A and D keys to navigate through the images
6. Use the Flip Image button OR the F key to flip images if needed
7. For each image, draw a tight rectangle around the plate in the image, and check the appropriate checkboxes. You can use the numbers on your keyboard to toggle checkboxes quickly. Drawing a rectangle involves clicking on the four corners of the plate in this order: top left, top right, bottom right, bottom left.
8. When you're done, use the Export All Results button to export the results to the "plates", and "labels" directories.

### Hotkeys
* "A" will go back one image
* "D" will go forward one image
* "F" will flip the image
* "1", "2", and "3" will toggle checkboxes
* "Enter" will alternate focus between the tag textbox and the list

### Additional Notes
* The load button will, as is described, load all rectangles and whatnot from the labels in the labels directory. This means you can export and quit and come back later! :)
* Flipping the image will actually modify (overwrite) the input image from the img directory.

## Image Resizer (ImageResizer.jar)

### Purpose
This is a very simple tool to resize (scale) all .jpg images in a directory.

### Usage
1. Put the ImageResizer.jar file in a directory
2. Place all images you want to scale into the same directory as the jar
3. Open a terminal and navigate it to the directory you placed the jar in
4. Execute "java -jar ImageResizer.jar"
5. Follow the prompt, and then it will begin resizing and replacing the images it finds in the directory
