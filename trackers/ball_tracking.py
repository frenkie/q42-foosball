# import the necessary packages
from __future__ import division
from collections import deque
from Tkinter import *
import numpy as np
import argparse
import imutils
import cv2
import logging
import math
import ballColors

# construct the argument parse and parse the arguments
ap = argparse.ArgumentParser()
ap.add_argument('-k', '--kinect',
				help='add when you want to track a kinect instead of webcam', action='store_true')
ap.add_argument('-b', '--buffer', type=int, default=64,
				help='max buffer size')

args = vars(ap.parse_args())

# define the lower and upper boundaries of the
# ball in the HSV color space
ballColor = ballColors.leonhart

pts = deque(maxlen=args['buffer'])

if not args.get('kinect'):
	camera = cv2.VideoCapture(0)
else:
	import freenect

tableDimensions = []
physicalTableSize = []
dragAndDraw = False;
dragPoint = []

#############################
######### GUI

master = Tk()
Label(master, text='Table Width (in cm)').grid(row=0)
Label(master, text='Table Height (in cm)').grid(row=1)

e1 = Entry(master)
e2 = Entry(master)

e1.grid(row=0, column=1)
e2.grid(row=1, column=1)


#############################

################################

# function to get RGB image from kinect
def get_video():
	array, _ = freenect.sync_get_video()
	array = cv2.cvtColor(array, cv2.COLOR_RGB2BGR)
	return array


# function to get depth image from kinect
def get_depth():
	array, _ = freenect.sync_get_depth()
	array = array.astype(np.uint8)
	return array


def getTableBounds():
	bounds = {}

	bounds['x'] = min(tableDimensions[0][0], tableDimensions[1][0])
	bounds['xMax'] = max(tableDimensions[0][0], tableDimensions[1][0])

	bounds['y'] = min(tableDimensions[0][1], tableDimensions[1][1])
	bounds['yMax'] = max(tableDimensions[0][1], tableDimensions[1][1])

	bounds['width'] = bounds['xMax'] - bounds['x']
	bounds['height'] = bounds['yMax'] - bounds['y']

	return bounds


def onMouse(event, x, y, flag, param):
	global tableDimensions, dragAndDraw, dragPoint

	if event == cv2.EVENT_LBUTTONDOWN:
		tableDimensions = [(x, y)]
		dragPoint = [(x, y)]
		dragAndDraw = True

	elif event == cv2.EVENT_MOUSEMOVE:
		if dragAndDraw:
			dragPoint = [(x, y)]

	elif event == cv2.EVENT_LBUTTONUP:
		dragAndDraw = False
		tableDimensions.append((x, y))


def printBallPosition(frame):
	global pts

	lastPos = pts[0]
	if not lastPos is None:

		bounds = getTableBounds()

		posX = lastPos[0] - bounds['x']
		posY = lastPos[1] - bounds['y']

		if posX >= 0 and posX <= bounds['width'] and posY >= bounds['y'] and posY <= bounds['height']:
			posXCm = math.floor((float(posX) / float(bounds['width'])) * float(physicalTableSize[0][0]))
			posYCm = math.floor((float(posY) / float(bounds['height'])) * float(physicalTableSize[0][1]))
			cv2.putText(frame, 'Ball position: x:{}, y:{}'.format(posXCm, posYCm),
						(10, frame.shape[0] - 10), cv2.FONT_HERSHEY_SIMPLEX,
						0.55, (255, 255, 255), 2)


def printTableSize(frame):
	global physicalTableSize

	if len(physicalTableSize) == 1:
		cv2.putText(frame, 'Table size ' + physicalTableSize[0][0] + 'cm x ' + physicalTableSize[0][1] + 'cm',
					(10, frame.shape[0] - 50), cv2.FONT_HERSHEY_SIMPLEX,
					0.55, (255, 255, 255), 2)


def setTableSize():
	global physicalTableSize, e1, e2, master

	physicalTableSize = [(e1.get(), e2.get())]
	master.destroy()


################################

logging.basicConfig(level=getattr(logging, 'INFO', None));

cv2.namedWindow('Frame')

# mouse is used to draw a rectangle over the table for tracking purposes
# only if a rectangle is drawn will ball positions be determined
cv2.setMouseCallback('Frame', onMouse, 0);

## GUI
Button(master, text='Save', command=setTableSize).grid(row=3, column=0, sticky=W, pady=4)

# user first has to enter table dimensions before we start tracking
mainloop()

# keep looping while tracking
while True:

	# grab the current frame
	if not args.get('kinect'):
		(grabbed, frame) = camera.read()
		if not grabbed:
			break
	else:
		frame = get_video()

	# resize the frame, blur it, and convert it to the HSV
	# color space
	frame = imutils.resize(frame, width=800)

	# blurred = cv2.GaussianBlur(frame, (11, 11), 0)

	if len(tableDimensions) == 2:
		bounds = getTableBounds()
		frameCut = frame[bounds['y']:(bounds['yMax']), bounds['x']:(bounds['xMax'])]
		hsv = cv2.cvtColor(frameCut, cv2.COLOR_BGR2HSV)
	else:
		hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

	# construct a mask for the ball color, then perform
	# a series of dilations and erosions to remove any small
	# blobs left in the mask
	mask = cv2.inRange(hsv, ballColor['lower'], ballColor['upper'])
	mask = cv2.erode(mask, None, iterations=2)
	mask = cv2.dilate(mask, None, iterations=2)

	# find contours in the mask and initialize the current
	# (x, y) center of the ball
	cnts = cv2.findContours(mask.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[-2]
	center = None

	# only proceed if at least one contour was found
	if len(cnts) > 0:
		# find the largest contour in the mask, then use
		# it to compute the minimum enclosing circle and
		# centroid
		c = max(cnts, key=cv2.contourArea)
		((x, y), radius) = cv2.minEnclosingCircle(c)
		M = cv2.moments(c)
		center = (int(M['m10'] / M['m00']), int(M['m01'] / M['m00']))

		# logging.info('Radius: %d', radius)

		# only proceed if the radius meets a minimum size
		if radius > 10:
			# draw the circle and centroid on the frame,
			# then update the list of tracked points
			cv2.circle(frame, (int(x), int(y)), int(radius),
					   (0, 255, 255), 2)
			cv2.circle(frame, center, 5, (0, 0, 255), -1)

	# update the points queue
	pts.appendleft(center)

	# loop over the set of tracked points
	for i in xrange(1, len(pts)):
		# if either of the tracked points are None, ignore
		# them
		if pts[i - 1] is None or pts[i] is None:
			continue

		# otherwise, compute the thickness of the line and
		# draw the connecting lines
		thickness = int(np.sqrt(args['buffer'] / float(i + 1)) * 2.5)
		cv2.line(frame, pts[i - 1], pts[i], (0, 0, 255), thickness)

	if len(physicalTableSize) == 1:
		printTableSize(frame)

	# rectangle anyone?
	if len(tableDimensions) == 1 and len(dragPoint) == 1:
		cv2.rectangle(frame, tableDimensions[0], dragPoint[0], (0, 255, 0), 2)

	elif len(tableDimensions) == 2:
		cv2.rectangle(frame, tableDimensions[0], tableDimensions[1], (0, 255, 0), 2)
		if len(physicalTableSize) == 1:
			printBallPosition(frame)

	# show the frame to our screen
	cv2.imshow('Frame', frame)

	if len(tableDimensions) == 2:
		cv2.imshow('Cutout', frameCut)


	key = cv2.waitKey(1) & 0xFF

	# if the 'q' key is pressed, stop the loop
	if key == ord('q'):
		break

# cleanup the camera and close any open windows
if not args.get('kinect'):
	camera.release()

cv2.destroyAllWindows()
