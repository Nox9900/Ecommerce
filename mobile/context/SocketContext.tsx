import React, { createContext, useContext, useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@clerk/clerk-expo";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { isSignedIn, userId } = useAuth();
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

    useEffect(() => {
        if (isSignedIn && userId) {
            // Connect to socket
            const newSocket = io(apiUrl, {
                transports: ["websocket"],
            });

            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                newSocket.emit("joinUser", userId);
            });

            setSocket(newSocket);

            return () => {
                newSocket.disconnect();
            };
        } else {
            if (socket) {
                socket.disconnect();
                setSocket(null);
            }
        }
    }, [isSignedIn, userId]);

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};
