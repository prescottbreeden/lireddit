"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const core_1 = require("@mikro-orm/core");
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const post_1 = require("./resolvers/post");
const user_1 = require("./resolvers/user");
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = express_1.default();
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await type_graphql_1.buildSchema({
            resolvers: [post_1.PostResolver, user_1.UserResolver],
            validate: false,
        }),
        context: () => ({ em: orm.em }),
    });
    apolloServer.applyMiddleware({ app });
    app.listen(4000, () => console.log('server started on localhost:4000'));
};
main().catch(console.error);
//# sourceMappingURL=index.js.map