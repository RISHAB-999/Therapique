import { createContext } from "react";

export const AppContext = createContext();


const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY
  const envBackendUrl = import.meta.env.VITE_BACKEND_URL
  const backendUrl = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? (envBackendUrl && !envBackendUrl.includes('trycloudflare.com') ? envBackendUrl : 'http://localhost:4000')
    : (envBackendUrl || 'http://localhost:4000')

  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
  const slotDateFormat = (slotDate) => {
    if (!slotDate) return ''
    const dateArray = String(slotDate).split('_')
    if (dateArray.length < 3) return slotDate
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  // Function to calculate the age eg. ( 20_01_2000 => 24 )
  const calculateAge = (dob) => {
    const today = new Date()
    const birthDate = new Date(dob)
    let age = today.getFullYear() - birthDate.getFullYear()
    return age
  }

  const value = {
    backendUrl,
    currency,
    slotDateFormat,
    calculateAge,
  }
  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
