import React, { Component } from 'react';
import grayLogo from './../assets/logo-gray.svg';
import * as routes from '../routes/routes.js';
import AuthUserContext from './AuthUserContext';
import {auth} from '../Utils/Firebase';

const AuthFooter = () =>
    <ul className="first">
        <li><a href={routes.Opportunities}>Leerkansen</a></li>
        <li><a href={routes.BecomeIssuer}>Word Issuer</a></li>
        <li><a href={routes.AboutUs}>Over ons</a></li>
        <li><a href={routes.News}>Nieuws</a></li>
        <li><a href={routes.Login} onClick={auth.doSignOut}>Log uit</a></li>
    </ul>

const NoAuthFooter = () =>
    <ul className="first">
        <li><a href={routes.Opportunities}>Leerkansen</a></li>
        <li><a href={routes.BecomeIssuer}>Word Issuer</a></li>
        <li><a href={routes.AboutUs}>Over ons</a></li>
        <li><a href={routes.News}>Nieuws</a></li>
        <li><a href={routes.Login}>Inloggen</a></li>
        <li><a href={routes.Register}>Registreer</a></li>
    </ul>

class Footer extends Component {
    render() {
        return (
            <footer>
                <div className="container footer">
                    <div className="content">
                        <AuthUserContext.Consumer>
                            {authUser => authUser ? <AuthFooter /> : <NoAuthFooter />}
                        </AuthUserContext.Consumer>
                        <div className="footer_bottom">
                            <img src={grayLogo} id="gray-logo" alt="logo" />
                            <div>
                                <ul className="bottom">
                                    {/* <li><a href="/">GDPR-beleid</a></li> */}
                                    {/* <li><a href="/">Cookiebeleid</a></li> */}
                                    <li><a href={routes.Conditions}>Conditions</a></li>
                                    <li><a href={routes.Privacy}>Privacy</a></li>
                                    {/* <li><a href="/">NL <i className="fas fa-caret-down"></i></a></li> */}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        );
    }
}
  
export default Footer;