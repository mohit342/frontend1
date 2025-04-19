import './App.css';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import SignupForm from './components/auth/Register';
import Login from './components/auth/Login';
import ForgetPassword from './components/auth/ForgetPassword';
import Profilepage from './pages/profile/Profilepage';
import Home from './pages/home/Home';
import Cart from './components/cart/Cart';
import Productpage from './pages/Productpage/Productpage';
import ProductDetailpage from './pages/ProductDetailpage/ProductDetailpage';
import Checkout from './pages/Checkout/Checkout';
import { CartProvider } from './components/context/CartContext';
import EnquiryForm from './components/EnquiryForm/EnquiryForm';
import Form from './components/Form/Form';
import Leader from './components/Leaders/Leader';
import Testimonials from './components/Testimonials/Testimonials';
import About from './components/About/About';
import TopTranding from './components/TopTranding/TopTranding';
import StudentProfile from './components/StudentProfile/StudentProfile';
import SchoolProfile from './components/SchoolProfile/SchoolProfile';
import SeProfile from './components/seProfile/SeProfile';
import OrderSuccess from './components/OrderSuccess/OrderSuccess';
import { SearchProvider } from './context/SearchContext';
import Return from './components/Return/Return';
import ReturnRequest from './components/ReturnRequest/ReturnRequest';

function App() {
  return (
    <SearchProvider>
   <CartProvider>
     <BrowserRouter>
     <Routes>
     <Route path='/register' element={<SignupForm />}/>
     <Route path='/about' element={<About/>}/>

       <Route path='/user/login' element={<Login/>}/>
       <Route path='/forgetpass' element={<ForgetPassword/>}/>
       <Route path='/' element={<Home />}/>
       <Route path='/profilepage' element={<Profilepage/>}/>
       <Route path="/student-profile" element={<StudentProfile/>}/>
       <Route path="/school-profile" element={<SchoolProfile/>}/>
       <Route path="/se-profile" element={<SeProfile/>}/>
       <Route path='/cart' element={<Cart/>}/>
       <Route path='/checkout' element={<Checkout/>}/>
       <Route path='/product' element={<Productpage/>}/>
       <Route path="/product/:slug" element={<ProductDetailpage />} />       
       <Route path='/enquiryform' element={<EnquiryForm/>}/>
       <Route path='/form' element={<Form/>}/>
       <Route path='/leader' element={<Leader/>}/>
       <Route path='/testinomials' element={<Testimonials/>}/>
       <Route path='/OrderSuccess' element={<OrderSuccess/>}/>
       <Route path='/Return' element={<Return/>}/>
       <Route path="/return-request/:orderId" element={<ReturnRequest />} />

     </Routes>
         
     </BrowserRouter>
   </CartProvider>
   </SearchProvider>
  );
}

export default App;
