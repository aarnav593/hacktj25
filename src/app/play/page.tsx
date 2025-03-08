"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link'
export default function play(){
    return(
        <div>
            {
                !localStorage.getItem("user") ?(
                <><p>you are not signed in</p><Link href="/login">Link to login</Link></>
            )
                :(
                <p>play stuff here</p>
            )
            }
        </div>
    );

}
const PlayPage = () => {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null)

}