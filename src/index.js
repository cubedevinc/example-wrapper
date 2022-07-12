import "./js/inject";
import "./js/dom";
import "./js/popup";
import "./js/feedback";
import "./js/tracking";
import Wrapper from "./js/wrapper";

export default (description) => {
    const wrapper = new Wrapper(description);
    wrapper.render();
};
