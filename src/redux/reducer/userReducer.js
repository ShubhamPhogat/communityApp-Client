import { CLEAR_USER, SET_USER } from "../actions/userActions";

const defaultState = {
  userInfo: null,
};
const userReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_USER:
      return {
        ...state,
        userInfo: action.payload,
      };

      break;
    case CLEAR_USER:
      return {
        ...state,
        userInfo: action.payload,
      };

    default:
      return state;
  }
};
export default userReducer;
