import { User, UserTC, ScheduleTC } from '../models';
import { authenticateTicket, verifyToken, createToken } from '../utils/authenticationUtils';

// Create a field NOT on the mongoose model; easy way to fetch schedule for a user in one trip
UserTC.addRelation("schedules", {
    "resolver": () => ScheduleTC.getResolver("findManyByUser"),
    prepareArgs: {
        _id: (source) => source._id,
    },
    projection: { schedules: 1 }
});

/**
 * Custom Resolvers
 */

/**
 * Authentication-related resolvers
 */

UserTC.addResolver({
    name: "authenticate",
    type: UserTC,
    args: { ticket: "String!" },
    resolve: async ({ source, args, context, info }) => {
        let authenticationResponse = await authenticateTicket(args.ticket);
        if (authenticationResponse.success) {
            let user; // this will be used as the return object

            // Get the netid of the authenticated user
            let { netid } = authenticationResponse;

            // Check if user exists based on netid
            let exists = User.exists({ netid: netid });
            if (!exists) {
                // Create user
                user = await User.create({ netid: netid });
            } else {
                user = await User.findOne({ netid: netid });
            }

            // Get a new token for the user
            let token = createToken(user);

            // Update the user's token and get their updated information
            return await User.findByIdAndUpdate(user._id, { token: token }, { new: true });
        } else {
            console.log("Bad auth!");
            throw Error("Bad authentication.");
        }
    }
});

UserTC.addResolver({
    name: "verify",
    type: UserTC,
    args: { token: UserTC.getFieldTC("token") },
    resolve: async ({ source, args, context, info }) => {
        let verificationResponse = await verifyToken(args.token);
        if (verificationResponse.success) {
            let { id } = verificationResponse;
            // Return logged in user's info
            return await User.findById(id);
        } else {
            console.log("Bad verify!");
            throw Error("Bad Verification.");
        }
    }
})

const UserQuery = {
    userOne: UserTC.getResolver('findOne'),
    userMany: UserTC.getResolver('findMany')
};

const UserMutation = {
    userCreateOne: UserTC.getResolver('createOne'),
    userUpdateOne: UserTC.getResolver('updateOne'),
    userRemoveOne: UserTC.getResolver('removeOne')
};

export { UserQuery, UserMutation };