module.exports = {
    schema : {
        fields : {
            id : "text",
            active : "boolean",
            completedon : "timestamp",
            addedby :"text",
            batchid :"text",
            contentid :"text",
            courseid :"text",
            courselogourl :"text",
            coursename :"text",
            datetime : "timestamp",
            delta :"text",
            description :"text",
            enrolleddate :"text",
            grade :"text",
            lastreadcontentid :"text",
            lastreadcontentstatus : "int",
            leafnodescount : "int",
            processingstatus : "text",
            progress : "int",
            status : "int",
            tocurl :"text",
            userid :"text"
        },
      key : ["id"],
     indexes : ["batchid","courseid","status","coursename","userid"]
    },
   name : "user_courses",
   db_type : "cassandra"
}