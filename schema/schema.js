const graphql = require('graphql');
const axios = require('axios');
//obtaining the GraphQLObjectType from 
//graphql library, 
//This objecttype will be used to create 
//instances which will be part of our schema
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
}= graphql;

//company type schema being created
const CompanyType = new GraphQLObjectType({
    name:"Company",
    //changing the fields into an arrow function
    //so that the UserType reference which is 
    //declared below is negated
    fields:()=>({
        id:{type:GraphQLString},
        name:{type:GraphQLString},
        description:{type:GraphQLString},
        //linking the company json 
        //with the users so that we can get
        //the list of users tagged to the
        //company
        //since we need a list of users
        //we use GraphQLList object
        users:{
            type:new GraphQLList(UserType),
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                 .then(response =>response.data)
            }

        }
    })
})


//a usertype schema being created

const UserType = new GraphQLObjectType({
    name: 'User',
    fields:()=>({
        id: {type: GraphQLString} ,
        firstName: {type: GraphQLString},
        age: {type: GraphQLInt},
        //linking the companyType with
        //userType
        company:{
            type:CompanyType,
            resolve(parentValue, args){
            return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
            .then(res=>res.data);
            }
        }
    })
});

//using root query helps in getting up with
//graphql. it gives us the first piece of data
//a user will be returned when a user id is passed
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields:{
        user:{
            type:UserType,
            args:{id:{type:GraphQLString}},
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(response=>response.data)
            }
        },
        company:{
            type:CompanyType,
            args:{id:{type:GraphQLString}},
            resolve(parentValue, args){
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(response=>response.data);
            }
        }
    }
});

//using mutation we will be manipulating our db
//here we are adding user to our db
const mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addUser:{
            type: UserType ,
            args:{
                firstName:{type:new GraphQLNonNull (GraphQLString)},
                age:{type:new GraphQLNonNull(GraphQLInt)},
                companyId:{type:GraphQLString}
            },
            resolve(parentValue, {firstName, age}){
               return axios.post(`http://localhost:3000/users`,{firstName, age})
               .then(res=>res.data)
            }
        },
        deleteUser:{
            type: UserType ,
            args:{
                id:{type:new GraphQLNonNull(GraphQLString)},
                
            },
            resolve(parentValue, args){
               return axios.delete(`http://localhost:3000/users/${args.id}`)
               .then(response=>response.data)
            }
        },
        editUser:{
            type: UserType ,
            args:{
                id:{type:new GraphQLNonNull(GraphQLString)},
                firstName:{type:new GraphQLNonNull (GraphQLString)},
                age:{type:GraphQLInt},
                companyId:{type:GraphQLString}
                
            },
            resolve(parentValue, args){
               return axios.patch(`http://localhost:3000/users/${args.id}`,args)
               .then(response=>response.data);
            }
        }
    }
})

module.exports = new GraphQLSchema({
    mutation,
    query:RootQuery
    
})