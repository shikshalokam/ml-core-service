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
        subEntityTypeList : function () {
            req.checkParams('_id')
            .exists()
            .withMessage("required Entity id");
        },
        getUsersByEntityAndRole: function () {
            req.checkParams('_id').exists().withMessage("required entity id")
            .isMongoId().withMessage("Invalid entity id");
            req.checkQuery('role').exists().withMessage("required role code");
        },
        subEntityListBasedOnRoleAndLocation : function () {
            req.checkParams('_id').exists().withMessage("required state location id");
            req.checkQuery('role').exists().withMessage("required role code");
        }
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