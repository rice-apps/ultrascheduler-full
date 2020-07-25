import React, { useState, useEffect } from "react";
import Selection from "./Selection";
import CourseList from "./CourseList";
import { initGA } from "../../utils/analytics";
import { useQuery, gql } from "@apollo/client";
import Button from "@material-ui/core/Button";
import { createMuiTheme } from "@material-ui/core/styles";
import { ThemeProvider } from "@material-ui/styles";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import "./CourseSearch.global.css";

const dummy = { label: "", value: "" };

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

/**
 * TODO: MAKE A FRAGMENT! THIS IS USED IN TWO PLACES
 * Gets the term from local state management
 */
const GET_TERM = gql`
    query {
        term @client
    }
`;

const GET_DEPARTMENTS = gql`
    query GetDepartments($term: Int!) {
        departments(term: $term)
    }
`;

const GET_DEPT_COURSES = gql`
    query GetDeptCourses($subject: String!, $term: Float!) {
        courseMany(filter: { subject: $subject }, sort: COURSE_NUM_ASC) {
            _id
            subject
            courseNum
            longTitle
            sessions(filter: { term: $term }) {
                _id
                crn
                class {
                    days
                    startTime
                    endTime
                }
                lab {
                    days
                    startTime
                    endTime
                }
                instructors {
                    firstName
                    lastName
                }
            }
        }
    }
`;
// new:
const GET_DIST_COURSES = gql`
    query CourseQuery($distribution: String!, $term: Float!) {
        courseMany(
            filter: { distribution: $distribution }
            sort: SUBJECT_AND_COURSE_NUM_ASC
        ) {
            _id
            subject
            courseNum
            longTitle
            distribution
            sessions(filter: { term: $term }) {
                _id
                crn
                class {
                    days
                    startTime
                    endTime
                }
                lab {
                    days
                    startTime
                    endTime
                }
                instructors {
                    firstName
                    lastName
                }
            }
        }
    }
`;

const GET_TIME_INTERVAL_COURSES = gql`
    query GetTimeIntervalCourses(
        $days: [String!]
        $startTime: String!
        $endTime: String!
        $term: Float!
    ) {
        sessionByDayAndTimeInterval(
            days: $days
            startTime: $startTime
            endTime: $endTime
            term: $term
        ) {
            course {
                _id
                subject
                courseNum
                longTitle
                distribution
                sessions(filter: { term: $term }) {
                    _id
                    crn
                    class {
                        days
                        startTime
                        endTime
                    }
                    lab {
                        days
                        startTime
                        endTime
                    }
                    instructors {
                        firstName
                        lastName
                    }
                }
            }
        }
    }
`;

const formatTime = (time) => {
    return time.replace(":", "");
};

const CourseSearch = ({ scheduleID }) => {
    const [getDepts, setDepts] = useState([]); // Used for the entire list of departments
    const [getDept, setDept] = useState(dummy); // Used for selection of a particular department
    const [getDist, setDist] = useState(dummy); // Used for selection of a particular distribution
    const [getStartTime, setStartTime] = useState("0630");
    const [getEndTime, setEndTime] = useState("2200");

    const allDistributions = [
        { label: "Distribution I", value: "Distribution I" },
        { label: "Distribution II", value: "Distribution II" },
        { label: "Distribution III", value: "Distribution III" },
    ]; // All distributions

    const allDaysLong = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
    ]; // All days in full name
    const allDaysMap = {
        Monday: "M",
        Tuesday: "T",
        Wednesday: "W",
        Thursday: "R",
        Friday: "F",
        Saturday: "S",
        Sunday: "U",
    }; // All days in abbreviation, used for query
    const [getDays, setDays] = useState([]);

    // Represents which button is currently clicked for styling and returning data
    const [activeButtonIndex, setButtonIndex] = useState(0);

    const {
        data: { term },
    } = useQuery(GET_TERM); // Gets the term which we need to request subjects from

    const { data: departmentsData } = useQuery(GET_DEPARTMENTS, {
        variables: { term },
    });

    // Convert day's longname to its abbreviation
    const convertDays = (days) => {
        // We need to first sort the selected array to match the order that is stored
        // in our database. Otherwise the $eq in SessionSchema will not work correctly
        // as the order of the elements in the selected array may be different from that
        // in the database
        days.sort((a, b) => {
            return allDaysLong.indexOf(a) - allDaysLong.indexOf(b);
        });
        return days.map((day) => allDaysMap[day]);
    };

    // These variables are used in displaySearch function and displayCourseList function:
    // Department is used as a placeholder for Instructors for now
    const searchTypes = [
        "Department",
        "Distribution",
        "Instructors",
        "Course Time",
        "Course Day",
    ];
    const allOptions = [getDepts, allDistributions, getDepts, getDepts];
    const allSelected = [getDept, getDist, getDept, getDept];
    const setFuncs = [setDept, setDist, setDept, setDept, setDays];
    const variables4Query = [
        { subject: getDept.value },
        { distribution: getDist.value },
        { subject: getDept.value },
        {
            days: convertDays(allDaysLong),
            startTime: getStartTime,
            endTime: getEndTime,
        },
        {
            days: convertDays(getDays),
            startTime: getStartTime,
            endTime: getEndTime,
        },
    ];
    const getQuery = [
        GET_DEPT_COURSES,
        GET_DIST_COURSES,
        GET_DEPT_COURSES,
        GET_TIME_INTERVAL_COURSES,
        GET_TIME_INTERVAL_COURSES,
    ];

    /**
     * We only want this to run when the subjects list data loads
     */
    useEffect(() => {
        if (departmentsData) {
            let { departments } = departmentsData;
            setDepts(departments.map((dept) => ({ label: dept, value: dept })));
        }
    }, [departmentsData]);

    // Set the selected departmen/distribution
    const handleChange = (selectedOption) => {
        const setFunc = setFuncs[activeButtonIndex];
        setFunc(selectedOption);
    };

    const handleStartTimeTFChange = (event) => {
        let selectedTime = event.target.value;
        console.log("selectedStartTime", selectedTime);
        setStartTime(formatTime(selectedTime));
    };
    const handleEndTimeTFChange = (event) => {
        let selectedTime = event.target.value;
        console.log("selectedEndTime", selectedTime);
        setEndTime(formatTime(selectedTime));
    };

    // Set color theme for the button for clicked and unclicked effect
    const muiTheme = createMuiTheme({
        palette: {
            primary: { main: "#697E99" },
            secondary: { main: "#FFFFFF" },
        },
    });

    const renderSearchOptions = () => {
        return searchTypes.map((type, index) => {
            /**
             * If the current index of the element is the same as the
             * active button index, then the button color is primary.
             * Otherwise, the button color is secondary.
             *
             */
            const buttonColor =
                index === activeButtonIndex ? "primary" : "secondary";

            return (
                <ThemeProvider theme={muiTheme}>
                    <Button
                        style={{
                            textTransform: "none",
                            marginRight: "12px",
                            marginTop: "6px",
                            marginBottom: "6px",
                            padding: "1px 24px 1px 24px",
                            borderRadius: "25px",
                            fontSize: "12px",
                        }}
                        color={buttonColor}
                        size="small"
                        variant="contained"
                        onClick={() => {
                            setButtonIndex(index);
                        }}
                    >
                        {type}
                    </Button>
                </ThemeProvider>
            );
        });
    };

    /**
     * Display the time textfield for user to select time range for the search
     */
    const displayTimeTF = (lbl, defaultVal, onChangeHandler) => {
        return (
            <TextField
                style={{
                    marginTop: "12px",
                    marginRight: "12px",
                    marginLeft: "50px",
                    width: "7vw",
                }}
                id="time"
                label={lbl}
                type="time"
                defaultValue={defaultVal}
                InputLabelProps={{
                    shrink: true,
                }}
                inputProps={{
                    step: 300, // 5 min
                }}
                onChange={onChangeHandler}
            />
        );
    };

    /**
     * Displays the select components for user to select days to search
     */
    const displayDaySelect = (vals, onChangeHandler) => {
        return (
            <Select
                style={{
                    marginTop: "20px",
                    marginLeft: "20px",
                    width: "25vw",
                }}
                multiple
                value={vals}
                onChange={(e) => onChangeHandler(e.target.value)}
                input={<Input />}
                renderValue={(selected) => selected.join(", ")}
                MenuProps={MenuProps}
            >
                {allDaysLong.map((day) => (
                    <MenuItem key={day} value={day}>
                        <Checkbox checked={vals.indexOf(day) > -1} />
                        <ListItemText primary={day} />
                    </MenuItem>
                ))}
            </Select>
        );
    };

    /**
     * Displays the search component based on the user's search option
     */
    const displaySearch = () => {
        const searchType = searchTypes[activeButtonIndex];
        const option = allOptions[activeButtonIndex];
        const selected = allSelected[activeButtonIndex];

        const selection = (
            <div>
                <Selection
                    className="filter"
                    title={searchType}
                    options={option}
                    selected={selected}
                    show={true}
                    handleChange={handleChange}
                />
            </div>
        );
        const time = (
            <div className="selectTime">
                {displayTimeTF("To", "06:00", handleStartTimeTFChange)}
                {displayTimeTF("From", "22:00", handleEndTimeTFChange)}
            </div>
        );
        const days = displayDaySelect(getDays, handleChange);
        const displayArray = [selection, selection, selection, time, days];

        return displayArray[activeButtonIndex];
    };

    /**
     * Displays the course list component based on whether user is searching
     * by distribution or by department
     */
    const displayCourseList = () => {
        return (
            <CourseList
                scheduleID={scheduleID}
                query={getQuery[activeButtonIndex]}
                searchType={variables4Query[activeButtonIndex]}
                idx={activeButtonIndex}
            />
        );
    };

    // Initialize Google Analytics
    initGA();

    return (
        <div className="searchBar">
            <div>
                <div className="filter">{displaySearch()}</div>
                <div className="searchTxt">Search By:</div>
                <div className="buttons">{renderSearchOptions()}</div>
            </div>
            {displayCourseList()}
        </div>
    );
};

export default CourseSearch;
