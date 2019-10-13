const express = require("express");
const expressGraphQl = require("express-graphql");
const { GraphQLID, GraphQLString, GraphQLList,
    GraphQLObjectType, GraphQLSchema, GraphQLNonNull } = require("graphql");
const Mongoose = require("mongoose");


const app = express();

Mongoose.connect("mongodb://localhost/people");

// Creating a mongoose model ...
const personModel = Mongoose.model("person", {
    firstName: String,
    lastName: String
})


// For GraphQl type definition ...
const personType = new GraphQLObjectType({
    name: "person",
    fields: {
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString }
    }
})

// Creating schema for graphql,
// This will include all query and mutation etc ...
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Query",
        fields: {
            people: {
                type: GraphQLList(personType),
                resolve: (root, args, context, info) => {
                    return personModel.find().exec();
                }
            },
            person: {
                type: personType,
                args: {
                    id: { type: GraphQLNonNull(GraphQLID) }
                },
                resolve: (root, args, context, info) => {
                    return personModel.findById(args.id).exec();
                }
            }
        }
    })
})

// Hooking up express with graphql ...
app.use("/graphql", expressGraphQl({
    schema: schema,
    graphiql: true
}))

app.listen(3000, () => {
    console.log("Listening at port 3000");
});