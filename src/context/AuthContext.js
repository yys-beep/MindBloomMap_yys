// src/context/AuthContext.js - 临时安全版本

import React, { createContext, useContext, useState } from 'react';

// 1. 创建 Context
const AuthContext = createContext();

// 2. 导出 AuthProvider 组件
// 这个组件现在不执行任何 Firebase 认证操作
export const AuthProvider = ({ children }) => {
    // 临时设置一个模拟的用户对象，防止依赖它的组件崩溃
    const [currentUser, setCurrentUser] = useState({ uid: 'guest-id', email: 'guest@test.com' });

    // 临时模拟登录和注册函数
    const signIn = (email, password) => {
        console.log("认证已被临时跳过：尝试登录");
        return Promise.resolve(true);
    };
    const signUp = (email, password) => {
        console.log("认证已被临时跳过：尝试注册");
        return Promise.resolve(true);
    };
    const logOut = () => {
         console.log("认证已被临时跳过：尝试退出");
         setCurrentUser(null);
         return Promise.resolve(true);
    };

    const value = {
        currentUser,
        signIn,
        signUp,
        logOut,
        loading: false,
        user: currentUser,
    };

 return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
