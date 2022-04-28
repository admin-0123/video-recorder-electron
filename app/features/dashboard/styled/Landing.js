import styled from 'styled-components';
export default styled.div`
	align-items: center;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 63px);
    overflow: hidden;
    position: relative;
    text-align: center;
    justify-content: center;
	min-height: 50px;

    .entry-container {
		padding: 30px;
	    background:  #fff;
	    z-index: 10;
	    border-radius: 0;
	    // box-shadow: 0 0 20px #0d1f3b;

    }
    .header-text {
	    display: flex;
	    flex-direction: column;
	    z-index: 2;

	    p {
		    margin-bottom: 40px;
		    font-size: 16px;
		    margin-top: 10px;
		    color: #333;
		}
	}
    .entry-box {
	    width: 320px;
	    margin: auto;

	}
    .btn.btn-block {
    	width: 100%;
    }
    .btn-primary {
	    background-color: #2F80ED;
	}
	.btn {
	    padding: 15px 25px;
	    border: none;
	    margin-bottom: 15px;
	    font-size: 15px;
	    font-weight: 700;
	    letter-spacing: 1px;
	}
	button {
	    color: #FFF;
		text-transform: uppercase;
	    border-radius: 4px;
	}

`;
