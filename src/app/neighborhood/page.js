"use client";

import React, { useState, useEffect } from "react";

export default function GovernoratesNeighborhoods() {
    const [governorates, setGovernorates] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);
    const [selectedGovernorate, setSelectedGovernorate] = useState("");

    useEffect(() => {
        fetchGovernorates();
    }, []);

    const fetchGovernorates = async () => {
        try {
            const response = await fetch("/api/governorate");
            const data = await response.json();
            setGovernorates(data);
        } catch (error) {
            console.error("Error fetching governorates:", error);
        }
    };

    const fetchNeighborhoods = async (governorateID) => {
        try {
            const response = await fetch(`/api/neighborhood/${governorateID}`);
            const data = await response.json();
            setNeighborhoods(data);
        } catch (error) {
            console.error("Error fetching neighborhoods:", error);
        }
    };

    const handleGovernorateChange = (event) => {
        const governorateID = event.target.value;
        setSelectedGovernorate(governorateID);
        fetchNeighborhoods(governorateID);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Governorates and Neighborhoods</h1>
            <div className="mb-4">
                <label className="block mb-2">Select Governorate:</label>
                <select
                    value={selectedGovernorate}
                    onChange={handleGovernorateChange}
                    className="border px-4 py-2"
                >
                    <option value="">-- Select Governorate --</option>
                    {governorates.map((gov) => (
                        <option key={gov._id} value={gov._id}>
                            {gov.nameEn}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <h2 className="text-xl font-semibold mb-2">Neighborhoods:</h2>
                <ul className="list-disc pl-5">
                    {neighborhoods.map((neigh) => (
                        <li key={neigh._id}>{neigh.nameEn}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
