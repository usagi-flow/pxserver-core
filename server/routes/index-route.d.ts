import Model from "../model";
import AbstractRoute from "./abstract-route";
export default class IndexRoute extends AbstractRoute {
    protected configureHandlers(model: Model): void;
    private handler;
    private testMessage;
}
