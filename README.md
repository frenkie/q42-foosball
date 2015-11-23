# Q42-foosball
Digital Foosball entry for the Q42 Hackathon


# Install
These install notes are for Mac.

## Prerequisites

### OpenCV for Python
To get OpenCV and Python running try installing them with [Brew](http://brew.sh/)

```

brew update

brew install python
brew tap homebrew/science
brew install opencv

```

To make sure the brew installed packages are used, make sure
the following is in your PATH

`export PATH=/usr/local/bin:$PATH`

Some extra Python libraries to install are
 
```
pip install numpy
``` 

### Freenect (the Open Kinect library) for Python

You don't need the Freenect library if you just want to track something
by using a webcam. If so, just skip ahead to the 'Running the trackers' chapter.

If you just want to check the Kinect connection you can do
 
`brew install freenect` 
and after that and connecting the Kinect run
`freenect-glview` from the command line.

To be able to program in Python with freenect install these prerequisites

```
pip install cython
pip install matplotlib
```

You can first try to run the trackers under `trackers/` and if they don't
run you need to replace `trackers/freenect.so` with a locally compile one.
To create that one checkout the freenect repository at [https://github.com/OpenKinect/libfreenect](https://github.com/OpenKinect/libfreenect)

Navigate to `wrappers/python`, edit `setup.py` and remove the reference
to `'/usr/local/lib64'`

Install the library locally in that directory with 
`python setup.py build_ext --inplace` and after
that you can move your copy of the freenect module to the `trackers/` folder			
			
			
# Running the trackers
			
You can run the tracker by navigating to `trackers/` and running the following:
 			
`python ball_tracking.py` for a Webcam tracker

or
 			
`python ball_tracking.py --kinect` for a Kinect tracker 			
			
After that enter your table dimensions and press Save. With your mouse,
draw a rectangle on the screen which will represent your foosball table.
When a ball is tracked in between this rectangle you'll see it's position
being output on screen.
			
			
			
			