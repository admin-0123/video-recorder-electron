
import { Types } from './actionTypes';
import { setStore,login ,getuserDetails,getStore} from './functions';

const initialState = {
  profile: {
    firstName: '',
    token:null,
    lastName: '',
    telephone: '',
    age: 28,
    email: '',
    state: '',
    country: '',
    address: 'Home',
    address1: '',
    address2: '',
    interests: [],
    profileImage: '',
    subscribenewsletter: false
  },
  userDetails:{},
  formSubmitted: false
}

export default async (state = initialState, action) => {
  switch (action.type) {
    case Types.LOGIN:
     var userData ={};
     let data = await login(action.payload.user.email,action.payload.user.password);
     console.log(data);
     if(data.access_token!=undefined) {
        setStore('user_token',data.access_token);
        userData =  await getuserDetails(data.access_token);
        await setStore('user_Data',userData);

        console.log(userData);
        console.log("userData");
        console.log( getStore('user_Data'));
        console.log("userData");
        location.reload();

     }
    //  console.log("data");
    //  console.log(data);
    
      return {
        ...state,
        profile: action.payload.user,
        formSubmitted: false, // after update user formsubmition reset,
        userDetails:userData
      }
    case Types.ADD_USER:
      return {
        ...state,
        profile: action.payload.user,
        formSubmitted: false // after update user formsubmition reset
      }
    case Types.UPDATE_USER:
      return {
        ...state,
        profile: action.payload.user,
        formSubmitted: false // after update user formsubmition reset
      }
    case Types.UPDATE_PROFILE_PICTURE:
      return {
        ...state,
        profile: {
          ...state.profile,
          profileImage: action.payload.image
        }
      }
    case Types.FORM_SUBMITION_STATUS:
      return {
        ...state,
        formSubmitted: action.payload.status
      }
    default:
      return state;
  }
}

