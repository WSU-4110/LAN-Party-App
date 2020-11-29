import React, { useState, useContext, Suspense } from "react";
import { AgeGate, RemoveMember } from "../ViewParty.js";
import { User } from "../User.js";

it('test if age gate window opens', () => {
    const mockedOpen = jest.fn();
    const originalOpen = window.open;
    window.open = mocked.Open;

    ViewParty.AgeGate(true);
    expect(window).toBeCalled();
})

it('if member is removed from party', () => {
    var Attendees = [1, 22, 33];
    ViewParty.RemoveMember(33);
    expect(Attendees).toNotInclude(33);
})