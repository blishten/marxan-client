import React from 'react';
import MarxanDialog from './MarxanDialog';
import ReactTable from "react-table";
import {isNumber, isValidTargetValue} from './genericFunctions.js'; 

class FeatureInfoDialog extends React.Component {
	getHTML(value, title = ''){
		return <div title={(title !== '') ? title : value}>{value}</div>;
	}
	//adds Kms to the area values and rounds to 1 decimal place 
	getAreaHTML(props){
		//set the font color to red if the area protected is less than the target area
		let color = (this.props.feature.protected_area < this.props.feature.target_area) && (props.row.key === 'Area protected') ? "red" : "rgba(0, 0, 0, 0.6)";
		//rounded to 1 dp
		let roundedText = ((Number(props.row.value/1000000).toFixed(1) === "0.0") && (props.row.value > 0)) ? " (approx.)" : "";
		let html = <div title={props.row.value/1000000 + ' Km2'} style={{color:color}}>{String(Number(props.row.value/1000000).toFixed(1)).replace(/\B(?=(\d{3})+(?!\d))/g, ",")} Km<span style={{verticalAlign: 'super', fontSize: 'smaller'}}>2</span>{roundedText}</div>;
		return html;   
	}
	renderKeyCell(props){
		return this.getHTML(props.row.key, props.original.hint);
	}
	//called when the user moves away from an editable property, e.g. target percent or spf
	updateFeatureValue(key, evt){
		var value = (key === "target_value") ? evt.currentTarget.innerHTML.substr(0, evt.currentTarget.innerHTML.length-1) : evt.currentTarget.innerHTML;
		if (((key === "target_value") && (isValidTargetValue(value))) || ((key === "spf") && (isNumber(value)))) {
			var obj = {};
			obj[key] = value;
			this.props.updateFeature(this.props.feature, obj);      
		}else{
			alert("Invalid value");
		}
	}
	renderValueCell(props){
		let html;
		switch (props.row.key) {
			case 'ID':
			case 'Alias':
			case 'Feature class name':
				html = this.getHTML(props.row.value, props.original.hint);
				break;
			case 'Description':
				html = this.getHTML(props.row.value);
				break;
			case 'Creation date': 
				html = this.getHTML(props.row.value);
				break;
			case 'Mapbox ID':
				html = ((props.row.value === "")||(props.row.value === null)) ? this.getHTML("Not available", "The feature was not uploaded to Mapbox") : this.getHTML(props.row.value, "The feature was uploaded to Mapbox with this identifier");
				break;
			case 'Total area':
				html = (props.row.value === -1) ? this.getHTML("Not calculated", "Total areas are not available for imported projects") : this.getAreaHTML(props, props.original.hint);
				break;
			case 'Target percent':
				html = (this.props.userRole === "ReadOnly") ? <div>{props.row.value}%</div> : <div contentEditable suppressContentEditableWarning title="Click to edit" onBlur={this.updateFeatureValue.bind(this, "target_value")}>{props.row.value}%</div>;
				break;
			case 'Species Penalty Factor':
				html = (this.props.userRole === "ReadOnly") ? <div>{props.row.value}%</div> : <div contentEditable suppressContentEditableWarning title="Click to edit" onBlur={this.updateFeatureValue.bind(this, "spf")}>{props.row.value}</div>;
				break;
			case 'Preprocessed':
				html = (props.row.value) ? this.getHTML("Yes", "The feature has been intersected with the planning units") : this.getHTML("No", "The feature has not yet been intersected with the planning units");
				break;
			case 'Planning unit count':
				html = (props.row.value === -1) ? this.getHTML("Not calculated", "Calculated during pre-processing") : this.getHTML(props.row.value);
				break;
			case 'Planning unit area':
				html = (props.row.value === -1) ? this.getHTML("Not calculated", "Calculated during pre-processing") : this.getAreaHTML(props);
				break;
			case 'Target area':
				html = (props.row.value === -1) ? this.getHTML("Not calculated", "Calculated during a Marxan run") : this.getAreaHTML(props);
				break;
			case 'Area protected':
				html = (props.row.value === -1) ? this.getHTML("Not calculated", "Calculated during a Marxan run") : this.getAreaHTML(props);
				break;
			default:
				break;
		}
		return html;
	} 
		render(){
			if (this.props.feature){
				let data =[];
				//iterate through the feature properties and set the data to bind to the table
				this.props.FEATURE_PROPERTIES.forEach((item)=>{
					if ((!this.props.feature.old_version) || (this.props.feature.old_version && item.showForOld)){
						data.push({key: item.key, value: this.props.feature[item.name], hint: item.hint});
					}
				}, this);
				return (
					<MarxanDialog title="Properties" 
						{...this.props}  
						contentWidth={380}
						offsetX={135}
						offsetY={250}
						children={
							<ReactTable 
								showPagination={false} 
								className={(this.props.feature.old_version) ? 'infoTableOldVersion' : 'infoTable'}
								minRows={0}
								pageSize={data.length}
								data={data}
								noDataText=''
								columns={[{
									 Header: 'Key', 
									 accessor: 'key',
									 width:150,
									 headerStyle:{'textAlign':'left'},
									 Cell: props => this.renderKeyCell(props)
								},{
									 Header: 'Value',
									 accessor: 'value',
									 width:185,
									 headerStyle:{'textAlign':'left'},
									 Cell: props => this.renderValueCell(props)
								}
								]}
							 key="k9"
							/>
						}
					/>);
			}else{
				return null;
		}
	}
}

export default FeatureInfoDialog;
