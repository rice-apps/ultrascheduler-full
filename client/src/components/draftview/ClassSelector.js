import React, { useState, useEffect, Fragment } from "react";
import {connect} from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
// Course evals
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
// Course visible
import Checkbox from '@material-ui/core/Checkbox';
// Has lab
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
// Delete course
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import SwipeableViews from "react-swipeable-views";

<<<<<<< HEAD:client/src/components/draftview/ClassSelector.js
// Tracking
import ReactGA from "react-ga";
import {toggleCourseRequest, removeCourseRequest} from '../../actions/CoursesActions';
import { initGA, Event } from "../../utils/analytics";
=======
import {toggleCourseRequest, removeCourseRequest} from '../../actions/CoursesActions';
>>>>>>> bed0d0f9d7b5225799d2e8f50111101b7299315f:client/src/components/ClassSelector.js
import { classTimeString } from '../../utils/CourseTimeTransforms';


const useStyles = makeStyles({
	table: {
		width: "100%"
	}
  });

const createURL = (crn, detail=true) => {
	if (detail) {
		// Return detail
		return `https://courses.rice.edu/courses/!SWKSCAT.cat?p_action=COURSE&p_term=202110&p_crn=${crn}`;
	} else {
		// Return eval
		return `https://esther.rice.edu/selfserve/swkscmt.main?p_term=202110&p_crn=${crn}&p_commentid=&p_confirm=1&p_type=Course`;
	}
}

const ClassSelector = ({draftCourses, toggleCourseRequest, removeCourseRequest}) => {
	const classes = useStyles();

	// Get headers
	let headers = ["Visible", "Course Code", "Class Days", "Class Time", "CRN", "Lab Days", "Lab Times", "Instructor(s)", "Remove"]

	const styles = {
		slideContainer: {
		  maxHeight: '50vh',
		  maxWidth: '100vw',
		  WebkitOverflowScrolling: 'touch', // iOS momentum scrolling
		},
	  };

	const emptyCellGenerator = (count) => {
		let cells = [];
		for (let i = 0; i < count; i++) {
			cells.push(<TableCell align="right"></TableCell>);
		}
		return cells;
	}

	// Initialize GA before use
	initGA();

	const handleCourseRemoveRequest = (course) => {
		let crnString = String.toString(course.crn);
		// Tracking 
		Event("COURSE_SELECTOR", "Remove Course from Schedule: " + crnString, crnString);

		// Remove course
		removeCourseRequest(course)
	}

	return (
		<TableContainer component={Paper}>
			<SwipeableViews containerStyle={styles.slideContainer}>
			<Table stickyHeader={true} className={classes.table} aria-label="simple table">
				<TableHead>
					<TableRow>
						{headers.map((heading, idx) => {
							if (idx == 0) {
								return (<TableCell>{heading}</TableCell>)
							} else {
								return (<TableCell align="right">{heading}</TableCell>)
							}
						})}
					</TableRow>
				</TableHead>
				<TableBody>
					{draftCourses.map((course) => (
						<TableRow key={course.crn}>
							<TableCell padding="checkbox">
								<Checkbox
								checked={course.visible}
								onClick={() => toggleCourseRequest(course)}
								/>
							</TableCell>
							<TableCell align="right" component="th" scope="row">
								<Tooltip title="View Course Details">
									<ReactGA.OutboundLink style={{ color: "#272D2D", textDecoration: 'none' }} eventLabel="course_description" to={createURL(course.crn)} target="_blank">
										<span style={{ color: "272D2D" }}>{course.courseName}</span>
									</ReactGA.OutboundLink>
									{/* <a href={createURL(course.crn)} target="_blank" style={{ color: '#272D2D' }}></a> */}
								</Tooltip>
								<Tooltip title="View Evaluations">
									<ReactGA.OutboundLink eventLabel="course_evaluation" to={createURL(course.crn, false)} target="_blank">
										<IconButton aria-label="evaluations">
											<QuestionAnswerIcon />
										</IconButton>
									</ReactGA.OutboundLink>
								</Tooltip>
							</TableCell>
							{course.class.hasClass ? (
								<Fragment>
									<TableCell align="right">{course.class.days}</TableCell>
									<TableCell align="right">{classTimeString(course.class.startTime, course.class.endTime)}</TableCell>
								</Fragment>
							) : <Fragment>{emptyCellGenerator(2)}</Fragment>}
							<TableCell align="right">{course.crn}</TableCell>
							{course.lab.hasLab ? (
								<Fragment>
									<TableCell align="right">{course.lab.days}</TableCell>
									<TableCell align="right">{classTimeString(course.lab.startTime, course.lab.endTime)}</TableCell>
								</Fragment>
							) : <Fragment>{emptyCellGenerator(2)}</Fragment>}
							<TableCell align="right">{course.instructors.join(" | ")}</TableCell>
							<TableCell align="right">
								<Tooltip title="Delete">
									<IconButton aria-label="delete" onClick={() => handleCourseRemoveRequest(course)}>
										<DeleteIcon />
									</IconButton>
								</Tooltip>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</SwipeableViews>
		</TableContainer>
	)
	// return (
	// 	<List>
	// 		{courses.map(course => {
	// 			return (
	// 				<ListItem key={course.crn} onClick={() => toggleCourse(course.crn)}>
	// 					{course.courseName}
	// 				</ListItem>
	// 			)
	// 		})}
	// 	</List>
	// )
}


export default connect(
        (state) => ({
            draftCourses: state.courses.draftCourses,
        }),
        (dispatch) => ({
			toggleCourseRequest: course => dispatch(toggleCourseRequest(course)),
			removeCourseRequest: course => dispatch(removeCourseRequest(course))
        }),
)(ClassSelector);