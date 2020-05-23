import { Instructor, InstructorTC, SessionTC } from '../models';

// Create a field NOT on the mongoose model; easy way to fetch sessions that an instructor teaches
InstructorTC.addRelation("sessions", {
    "resolver": () => SessionTC.getResolver("findByInstructor"),
    prepareArgs: {
        _id: (source) => source._id,
    },
    projection: { sessions: 1 }
});

const InstructorQuery = {
    instructorOne: InstructorTC.getResolver('findOne'),
    instructorMany: InstructorTC.getResolver('findMany'),
};

const InstructorMutation = {
    instructorCreateOne: InstructorTC.getResolver('createOne')
};

export { InstructorQuery, InstructorMutation };