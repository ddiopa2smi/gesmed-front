// import { AbilityBuilder, createMongoAbility } from "@casl/ability";
// export function defineAbilityFor( user ) {

import { AbilityBuilder, createMongoAbility } from "@casl/ability";

    
//     const rules = [
//         {
//             action: 'manage',
//             subject: 'all'
//         }
//     ];

//     //const { can, cannot , build } = new AbilityBuilder(createMongoAbility(rules))
//     const { can, cannot , build } = new AbilityBuilder(createMongoAbility)
    
//     switch (user.role_name) {
//         case "AdminIPM":
//             can("manage","all");
//             break;
//         case "AdminMED":
//             can("manage","all");
//             break;
//         case "Admin":
//             can("manage","all");
//             break;
//         default:
//             break;
//     }

//     return build()
// };

// export const ability = defineAbilityFor({
//     role_name : JSON.parse(sessionStorage.getItem("userConnected"))?.role_name || 'guest'
// }) 





const defineAbilitiesFor = (permissions) => {
    const { can, rules } = new AbilityBuilder();

    // Parcourir les autorisations récupérées de la base de données et les ajouter à l'objet Ability
    permissions.forEach((permission, key) => {
        console.log(permission)
      can(permission.action, permission.subject, permission.condition);
    });

    return new createMongoAbility(rules);
};


const adminPermissions = [
    {
        action: 'manage',
        subject: 'all'
    },
];

const guestPermissions = [
    // {
    //     action: 'update',
    //     subject: 'account'
    // },
    // {
    //     action : 'create',
    //     subject : 'account'
    // }
];
const infirmierPermissions = [
    {
        action: 'update',
        subject: 'account'
    },
];

const medecinPermissions = [
    {
        action: 'manage',
        subject: 'account',
    },
];

const permissions = medecinPermissions;

export const ability = defineAbilitiesFor(permissions) || {};
