import React from 'react';
import NavigationButtons from '../NavigationButtons';
import '../../styles/PageContainer.css';

const Volcano = () => {
  return (
    <div className="page-container">
      <NavigationButtons />
      <div className="page-content">
        <h1>Volcano Page</h1>
        <p>This is the Volcano page. Replace with your content.</p>
      </div>
    </div>
  );
};

export default Volcano;
