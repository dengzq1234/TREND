function getOptions() {
	var firstFile = $('#first-file')[0].files[0];
	if (typeof $('#second-file')[0] != 'undefined') {
	    var secondFile = $('#second-file')[0].files[0];
    }
    if (typeof $('#third-file')[0] != 'undefined') {
        var thirdFile = $('#third-file')[0].files[0];
    }
	var firstFileArea = $('#first-file-area').val();
	var secondFileArea = $('#second-file-area').val();
	var thirdFileArea = $('#third-file-area').val();
    var alignmentAlg = $('#alignment-alg').val();
    var treeBuildMethod = $('#tree-method').val();

    var mlSubstModel = $('#ml-subst-model').val();
    var njMeSubstModel = $('#nj_me-subst-model').val();

    var aaSubstRate = $('#subst-rate').val();
    var initialTreeForMl = $('#initial-tree-ml').val();
    var gapsAndMissingData = $('#gaps-missing').val();
    var siteCovCutOff = $('#site-cov-cutoff').val();
    var njMePhyloTest = $('#nj_me-phylo-test').val();
    var mlPhyloTest = $('#ml-phylo-test').val();
    var numberOrReplicates = $('#number-of-replicates').val();
    var domainPredictionProgram = $('#domain-prediction-program').val() //set up!

    var optionToOptionNameMain = {
        "firstFile": firstFile,
        "secondFile": secondFile,
        "thirdFile": thirdFile,
        "firstFileArea": firstFileArea,
        "secondFileArea": secondFileArea,
        "thirdFileArea": thirdFileArea,
        "alignmentAlg": alignmentAlg,
        "treeBuildMethod": treeBuildMethod,
        "aaSubstRate": aaSubstRate,
        "initialTreeForMl": initialTreeForMl,
        "gapsAndMissingData": gapsAndMissingData,
        "siteCovCutOff": siteCovCutOff,
        "numberOrReplicates": numberOrReplicates,
        "domainPredictionProgram": domainPredictionProgram,
        "commandToBeProcessedBy": $('#subnavigation-tab').text()
    }
    var optionToOptionNameSubsModel = {
        "mlSubstModel": mlSubstModel,
        "njMeSubstModel": njMeSubstModel
    }
    var optionToOptionNamePhyloTest = {
        "njMePhyloTest": njMePhyloTest,
        "mlPhyloTest": mlPhyloTest
    }
    var options = new FormData();

    for (optionName in optionToOptionNameMain) {
        console.log("optionName " + optionName)
        console.log("optionToOptionNameMain[optionName] " + optionToOptionNameMain[optionName])
        if (optionIsDefined(optionName, optionToOptionNameMain[optionName], options)) {
            options.append(optionName, optionToOptionNameMain[optionName]);
        }
    }
    for (optionName in optionToOptionNameSubsModel) {
        console.log("optionName " + optionName)
        console.log("optionToOptionNameSubsModel[optionName] " + optionToOptionNameSubsModel[optionName])
        if (optionIsDefined(optionName, optionToOptionNameSubsModel[optionName], options)) {
            options.append("aaSubstModel", optionToOptionNameSubsModel[optionName]);
        }
    }
    for (optionName in optionToOptionNamePhyloTest) {
        console.log("optionName " + optionName)
        console.log("optionToOptionNamePhyloTest[optionName] " + optionToOptionNamePhyloTest[optionName])
        if (optionIsDefined(optionName, optionToOptionNamePhyloTest[optionName], options)) {
            options.append("phylogenyTest", optionToOptionNamePhyloTest[optionName]);
        }
    }


	return options;
}

function optionIsDefined(option) {
    if (typeof option != 'undefined') {
        if (option != '') {
            return true;
        }
    }
    return false;
}


