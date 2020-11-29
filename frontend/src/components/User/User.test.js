import React, { useState, useContext, Suspense } from "react";
import { User, changeEmail, changePassword, changeAbout } from "../User.js";
import { shallow } from "enzyme";

describe('changing values for user', () => {
    let props;
  
    beforeEach(() => {
      props = {
        Email: '',
        Password: '',
        About: ''
        }
    });


    it('change email', () => {
        const wrapper = shallow(<User {...props} />);
        wrapper.setState({ Email: 'testcase@js.com'});
        User.changeEmail('changed@1234.com', e);
        expect(User.Email).toHaveLength(16);
    });

    it('change password', () => {
        const wrapper = shallow(<User {...props} />);
        wrapper.setState({ Password: 'default'});
        User.changePassword('password', e);
        expect(User.Password).toHaveLength(8);

    
    })

    it('change about', () => {
        const wrapper = shallow(<User {...props} />);
        wrapper.setState({ About: 'default'});
        User.changePassword('about me', e);
        expect(User.About).toHaveLength(8);
    
    })


})
