import config from '../config';
import axios from 'axios'


/**
 * Set localStorage
 */
 export const setStore = (name, content) => {
    if (!name) return
    if (typeof content !== 'string') {
      content = JSON.stringify(content)
    }
    return window.localStorage.setItem(name, content)
  }
  
  /**
    * Get localStorage
  */
  export const getStoreSingle = (name) => {
    if (!name) return
    return window.localStorage.getItem(name)
  }
  
  export const setStoreSingle = (name, content) => {
    if (!name) return
    // if (typeof content !== 'string') {
    //   content = JSON.stringify(content)
    // }
    return window.localStorage.setItem(name, content)
  }
  
  /**
    * Get localStorage
  */
  export const getStore = (name) => {
    if (!name) return
    return JSON.parse(window.localStorage.getItem(name))
  }
  /**
   * Clear localStorage
  */
  export const removeItem = (name) => {
    if (!name) return
    return window.localStorage.removeItem(name)
  }
  
  /**
   * Validate Email address
   */
  export const isValidEmail = (value) => {
    return !(value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,64}$/i.test(value))
  }
  
  /**
   * Format Phone Number
   */
  export const formatPhoneNumber = (value) => {
    if (!value) return
    const currentValue = value.replace(/[^\d]/g, '');
    const mobileNoLength = currentValue.length;
    if (mobileNoLength >=7) {
      if (mobileNoLength < 4) return currentValue;
      if (mobileNoLength < 7) return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3)}`;
      return `(${currentValue.slice(0, 3)}) ${currentValue.slice(3, 6)}-${currentValue.slice(6, 10)}`;
    } else{
      return currentValue;
    }
  }
  export const  login = (email, password) => {
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    };

    return fetch(`${config.apiUrl}api/login`, requestOptions)
        .then(handleResponse).then(user => {
            return user;
        });
}
export const  getuserDetails = (token) => {

        // axios.defaults.headers.common['Authorization'] =  `Bearer ${response.token}`;
        // let dataR ={};
        // axios.get(`${config.apiUrl}api/user`)
        // .then(({data})=>{

            
        // })
        const requestOptions = {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
           // body: JSON.stringify({ email, password })
        };
    
        return fetch(`${config.apiUrl}api/user`, requestOptions)
            .then(handleResponse).then(user => {
                return user;
            });
        
       
}
export const handleResponse = (response) =>{
    return response.text().then(text => {
        const data = text && JSON.parse(text);
      //  console.log(response);
        if (!response.ok) {
            if (response.status === 422) {
                // auto logout if 401 response returned from api
                //logout();
                console.log(data);
                //location.reload(true);
            }

            const error = (data && data) || response.statusText;
            return error;
        }

        return data;
    });
}