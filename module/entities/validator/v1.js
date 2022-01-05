module.exports = (req) => {
    let entityValidator = {
        listByEntityType : function () {
            req.checkParams('_id').exists().withMessage("required Entity type");
        },
        immediateEntities : function () {
            req.checkParams('_id').exists().withMessage("required Entity id");
        },
        listByIds : function () {
            req.checkBody('entities').exists().withMessage("required Entity ids")
            .isArray().withMessage("entities should be array")
            .notEmpty().withMessage("entities cannot be empty")
            .custom(entities => 
                entitiesValidation(entities)
            ).withMessage("invalid entity ids");
        },
        getUsersByEntityAndRole: function () {
            req.checkParams('_id').exists().withMessage("required entity id")
            .isMongoId().withMessage("Invalid entity id");
            req.checkQuery('role').exists().withMessage("required role code");
        },
        subEntityListBasedOnRoleAndLocation : function () {
            req.checkParams('_id').exists().withMessage("required state location id");
            req.checkQuery('role').exists().withMessage("required role code");
        },
        details : function () {
            req.checkParams('_id').optional()
            .isMongoId().withMessage("Invalid entity id");

            req.checkBody('entityIds').optional()
            .isArray().withMessage("entityIds should be array")
            .custom(entities => 
                entitiesValidation(entities)
            ).withMessage("invalid entity ids");

            req.checkBody('locationIds').optional()
            .isArray().withMessage("locationIds should be array")
            .custom(location => 
                gen.utils.checkValidUUID(location)
            ).withMessage("invalid location ids");

            req.checkBody('codes').optional()
            .isArray().withMessage("codes should be array")
            
        },
    }

    if (entityValidator[req.params.method]) {
        entityValidator[req.params.method]()
    }

    function entitiesValidation(entity) {
        let isObjectIds = true;
        if(Array.isArray(entity)){
            for (var i = 0; entity.length > i; i++) {
                if(!ObjectId.isValid(entity[i])) {
                    isObjectIds = false;
                } 
            }
        }
        
        return isObjectIds;
        
    }
}