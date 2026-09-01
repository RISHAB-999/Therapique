import health from "../assets/categories/health.png";
import selfHelpCounseling from "../assets/categories/Self_Help_&_Counseling.png";
import childrenParenting from "../assets/categories/Children_&_Parenting.png";
import relationshipsFamily from "../assets/categories/Relationships_&_Family.png";
import traumaRecovery from "../assets/categories/trauma_recovery.png";
import addictionRecovery from "../assets/categories/Addiction_Recovery.png";
import cbt from "../assets/categories/cbt.png";
import creativeTherapy from "../assets/categories/Creative_Therapy.png";

export const categories = [
  { name: "Mental Health", image: health },
  { name: "Self-Help & Counseling", image: selfHelpCounseling },
  { name: "Children & Parenting", image: childrenParenting },
  { name: "Relationships & Family", image: relationshipsFamily },
  { name: "Trauma Recovery", image: traumaRecovery },
  { name: "Addiction Recovery", image: addictionRecovery },
  { name: "CBT & Psychology", image: cbt },
  { name: "Creative Therapy", image: creativeTherapy }
];

export const dummyBooks = [];
export const dummyOrders = [];
export const dummyAddress = [
  {
    type: 'Home',
    firstName: 'Rishab',
    lastName: 'Negi',
    email: 'rishabn090@gmail.com',
    phone: '8130758753',
    street: 'Flat 304, Sector 6, Dwarka',
    line1: 'Flat 304, Sector 6, Dwarka',
    city: 'New Delhi',
    state: 'Delhi',
    zipcode: '110075',
    country: 'India'
  }
];
