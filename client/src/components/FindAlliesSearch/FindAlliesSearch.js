import React, { useState } from 'react';
import Jumbotron from '../Jumbotron/Jumbotron';
import Header from "../Header/Header";





const FindAlliesSearch = () => {

    return (
        <div>
            <Jumbotron>
            <h1>Recruit Allies</h1>
                <form>
                    <label>
                        Name:
                    <input type="text" name="name" />
                    </label>
                    <input type="submit" value="Submit" />
                </form>
            </Jumbotron>

        </div>


    )
}
export default FindAlliesSearch;