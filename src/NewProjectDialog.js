import React from 'react';
import Metadata from './Metadata';
import PlanningUnitsDialog from './PlanningUnitsDialog';
import SelectFeatures from './SelectFeatures';
import SelectCostFeatures from './SelectCostFeatures';
import MarxanDialog from './MarxanDialog';
import FeaturesDialog from './FeaturesDialog';
import ToolbarButton from './ToolbarButton';

class NewProjectDialog extends React.Component {
	constructor(props) {
			super(props);
			this.state = {
					steps: ['Info', 'Planning units', 'Features', 'Costs'],
					loadingFeatures: false,
					finished: false,
					stepIndex: 0,
					name: '',
					description: '',
					pu: '',
					featuresDialogOpen: false,
					allFeatures: [],
					selectedFeatureIds: []
			};
	}
	componentDidUpdate(prevProps, prevState) {
			if (prevProps.features.length !== this.props.features.length) { //coarse comparison at the moment
					this.setState({ allFeatures: JSON.parse(JSON.stringify(this.props.features)) }); //a copy of all the features
			}
	}
	handleNext = () => {
			const { stepIndex } = this.state;
			this.setState({
					stepIndex: stepIndex + 1
			});
	};
	handlePrev = () => {
			const { stepIndex } = this.state;
			if (stepIndex > 0) {
					this.setState({ stepIndex: stepIndex - 1 });
			}
	};
	openFeaturesDialog() {
			this.setState({ featuresDialogOpen: true });
	}
	setName(value) {
			this.setState({ name: value });
	}
	setDescription(value) {
			this.setState({ description: value });
	}
	changePU(value) {
			this.setState({ pu: value });
	}
	onOk(evt) {
			this.gotoStart();
			this.props.onOk();
	}
	gotoStart() {
			//reset to the beginning
			this.setState({ stepIndex: 0 });
	}
	closeFeaturesDialog() {
			this.setState({ featuresDialogOpen: false });
	}
	//updates the allFeatures to set the various properties based on which features have been selected in the FeaturesDialog
	updateSelectedFeatures() {
			let allFeatures = this.state.allFeatures;
			allFeatures.forEach((feature) => { 
					if (this.state.selectedFeatureIds.includes(feature.id)) {
							Object.assign(feature, { selected: true });
					}
					else {
							Object.assign(feature, { selected: false });
					}
			}, this);
			//update allFeatures to reflect those that are selected
			this.setState({ allFeatures: allFeatures});
			this.closeFeaturesDialog();
	}

	clickFeature(feature) {
			let ids = this.state.selectedFeatureIds;
			if (ids.includes(feature.id)) {
					//remove the feature if it is already selected
					this.removeFeature(feature);
			}
			else {
					//add the feautre to the selected feature array
					this.addFeature(feature);
			}
	}
	//selects all the features
	selectAllFeatures() {
			let ids = [];
			this.state.allFeatures.forEach((feature) => {
					ids.push(feature.id);
			});
			this.setState({ selectedFeatureIds: ids });
	}

	//clears all the Conservation features
	clearAllFeatures() {
			this.setState({ selectedFeatureIds: [] });
	}

	//removes a feature from the selectedFeatureIds array
	removeFeature(feature) {
			let ids = this.state.selectedFeatureIds;
			//remove the feature  - this requires a callback on setState otherwise the state is not updated before updateSelectedFeatures is called
			ids = ids.filter(function(value, index, arr) { return value !== feature.id });
			return new Promise(function(resolve, reject) {
					this.setState({ selectedFeatureIds: ids }, function() {
							resolve();
					});
			}.bind(this));
	}

	//adds a feature to the selectedFeatureIds array
	addFeature(feature) {
			let ids = this.state.selectedFeatureIds;
			//add the feautre to the selected feature array
			ids.push(feature.id);
			this.setState({ selectedFeatureIds: ids });
	}

	createNewProject() {
			this.props.createNewProject({ name: this.state.name, description: this.state.description, planning_grid_name: this.state.pu, features: this.state.allFeatures.filter((item) => { return item.selected }) });
			this.onOk();
	}

	render() {
			const { stepIndex } = this.state;
			const contentStyle = { margin: '0 16px' };
			const actions = [
					<div style={{width: '100%', maxWidth: '500px', margin: 'auto',textAlign:'center'}}>
							{/*dynamically create the stepper
							<Stepper activeStep={stepIndex}>
									{this.state.steps.map((item) => {return <Step key={item}><StepLabel>{item}</StepLabel></Step>})}
							</Stepper> */}
							<div style={contentStyle}>
									<div style={{marginTop: 12}}>
											<ToolbarButton 
													label="Back" 
													disabled={stepIndex === 0}  
													onClick={this.handlePrev} 
											/>
											<ToolbarButton 
													label={stepIndex === (this.state.steps.length-1) ? 'Finish' : 'Next'} 
													onClick={stepIndex === (this.state.steps.length-1) ? this.createNewProject.bind(this) : this.handleNext} 
													primary={true} 
											/>
									</div>
							</div>
					</div>
			];
			let c = <div key="k3">
									{stepIndex === 0 ? <Metadata name={this.state.name} description={this.state.description} setName={this.setName.bind(this)} setDescription={this.setDescription.bind(this)} paddingBottom={'198px'}/> : null}
									{stepIndex === 1 ? <PlanningUnitsDialog 
										getPlanningUnitGrids={this.props.getPlanningUnitGrids} 
										planning_unit_grids={this.props.planning_unit_grids} 
										changeItem={this.changePU.bind(this)} pu={this.state.pu} 
										openImportPlanningGridDialog={this.props.openImportPlanningGridDialog}/> : null}
									{stepIndex === 2 ? <SelectFeatures 
											features={this.state.allFeatures.filter((item)=>{return item.selected;})}
											openFeaturesDialog={this.openFeaturesDialog.bind(this)}  
											simple={true}
											leftmargin={'0px'}
									/> : null}
									{stepIndex === 3 ? <SelectCostFeatures
											openCostsDialog={this.props.openCostsDialog}
											selectedCosts={this.props.selectedCosts}
									/> : null}
							</div>;
			return (
					<React.Fragment>
					<MarxanDialog 
							{...this.props} 
							title={'New project'}
							contentWidth={400}
							children={c} 
							actions={actions} 
							okLabel={"Cancel"}
							onOk={this.onOk.bind(this)}
							onCancel={this.onOk.bind(this)}
							onRequestClose={this.onOk.bind(this)} 
					/>
						<FeaturesDialog
							open={this.state.featuresDialogOpen}
							onOk={this.updateSelectedFeatures.bind(this)}
							onCancel={this.closeFeaturesDialog.bind(this)}
							loadingFeatures={this.state.loadingFeatures}
							allFeatures={this.state.allFeatures}
							selectAllFeatures={this.selectAllFeatures.bind(this)}
							clearAllFeatures={this.clearAllFeatures.bind(this)}
							clickFeature={this.clickFeature.bind(this)}
							addingRemovingFeatures={true}
							selectedFeatureIds={this.state.selectedFeatureIds}
							metadata={{OLDVERSION:false}}
							userRole={"User"}
						/>
					</React.Fragment>
			);
	}
}

export default NewProjectDialog;
