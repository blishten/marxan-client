import React from 'react';
import Dialog from 'material-ui/Dialog';
import ToolbarButton from './ToolbarButton';
import Sync from 'material-ui/svg-icons/notification/sync'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

//properties can be:
//contentWidth - the width of the content area
//offsetX - the distance from the left edge (mutually exclusive with rightX)
//rightX - the distance from the right edge (mutually exclusive with offsetX)
//offsetY - the distance from the top
//onOk - fired when the OK button is clicked
//onCancel - fired when the Cancel button is clicked or when the dialog needs to be closed
//showCancelButton - set to true to show the cancel button
//actions - an array of components to add to the actions array in the dialog

class MarxanDialog extends React.Component {
	render() {
		//if the offsetX or rightX is set, then make this into a style
		let offsetX = (this.props.offsetX) ? {marginLeft: this.props.offsetX + 'px', width: '400px'} : (this.props.rightX) ? {right: this.props.rightX + 'px', width: '400px', left:null} : {};
		let offsetY = (this.props.offsetY) ? {marginTop: this.props.offsetY - 60 + 'px'} : {};
		let style = Object.assign(offsetX, offsetY);
		let cancelButton = (this.props.showCancelButton) ? <ToolbarButton label={(this.props.cancelLabel) ? this.props.cancelLabel : "Cancel"} primary={true} onClick={this.props.onCancel} disabled={this.props.cancelDisabled}/> : null;
		let contentStyle = (this.props.contentStyle) ? this.props.contentStyle : (this.props.contentWidth) ? {width: this.props.contentWidth + 'px'} : {};
		return (
			<Dialog      
				{...this.props} 
				onRequestClose={this.props.onCancel}
				overlayStyle={(this.props.showOverlay) ? {display:'block'} : {display:'none'}}
				titleClassName={'dialogTitleStyle'}
				contentStyle={contentStyle} 
				titleStyle={(this.props.titleBarIcon) ? {marginLeft: '27px'} : null}
				className={'dialogGeneric'}
				style={style} 
				actions={[
					this.props.actions,
					cancelButton, 
					<ToolbarButton 
						label={(this.props.okLabel) ? this.props.okLabel : "OK"} 
						primary={true} 
						onClick={this.props.onOk} 
						disabled={this.props.okDisabled}
					/>,
				]} 
				children={[
					(this.props.titleBarIcon) ? <FontAwesomeIcon icon={this.props.titleBarIcon} style={{position: 'absolute', top: '18px', left: '24px'}} key="k1"/> : null,
					<Sync className='spin' style={{display: (this.props.loading || this.props.showSpinner) ? "inline-block" : "none", color: 'rgb(255, 64, 129)', position: 'absolute', top: '13px', right: '14px'}} key={"spinner"}/>, this.props.children
				]}
			/>
		);
	}
}

export default MarxanDialog;