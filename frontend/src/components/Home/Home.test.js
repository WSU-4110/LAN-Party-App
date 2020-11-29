import React, { useState, useContext, Suspense } from "react";
import App from "../App";
import onSubmit from "../HostParty";
import { Home, getParties } from "../Home";

it('if any parties are retrieved', () => {
    const payload = {
        Host: 123,
        HostUsername: "Marv",
        PartyName: "test party",
        PartyLocation: {
          Name: "Home",
          Latitude: 0,
          Longitude: 0,
        },
        PartyTime: "Nov 30, 2020 11:11 am",
        HardwareReq: null,
        MinAge: 22,
        Notes: null,
         }

    HostParty.onSubmit(payload, e);

    const parties = getParties();
    expect(getParties()).toContain("Marv");
})