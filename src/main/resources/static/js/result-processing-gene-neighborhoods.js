//Figure
svgWidth = 700;
svgHeight = 300;

clusterFrameHeight = svgHeight*0.17;
frameRectXRadius = 7;
frameRectYRadius = 7;

//Gene cluster
directGeneFigureTopY = 3.4;
geneFigureWidth = 17;
directGeneFigureBottomY = directGeneFigureTopY + geneFigureWidth;
directGeneFigureMiddlePointY = directGeneFigureTopY + geneFigureWidth*0.5;
reverseGeneFigureTopY = directGeneFigureBottomY+10;
reverseGeneFigureBottomY = reverseGeneFigureTopY + geneFigureWidth;
reverseGeneFigureMiddlePointY = reverseGeneFigureTopY + geneFigureWidth*0.5;
geneFigureArrowLen = 10;
fillColour = 'white';
borderColour = '#7FB9AB';
currentGeneColour = "#7FB9AB";
lastGeneStop = null;
yShiftOfClusterRegardingLeafeYCoord = 25;
axisYTranslation = 25;

//Gene info box
//Need to make textPositionFactorDirect, textPositionFactorReverse,
//substractions from directGeneInfoBoxY and reverseGeneInfoBoxY calculable, not hard-coded
infoBoxWidth = 300;
infoBoxHeight = svgHeight*0.3;
infoBoxRectXRadius = 3;
infoBoxRectYRadius = 3;
directGeneInfoBoxY = directGeneFigureTopY-89;
reverseGeneInfoBoxY = reverseGeneFigureTopY-89;
textPositionFactorDirectY = 110;
textPositionFactorReverseY = 83;
textPositionFactorX = -10;
textPositionFactorXLast = -10;
xShiftLeft = 0.03;
xShiftLeftLast = 0.03;
clusterOffsetLeft = 0.05;
clusterOffsetRight = 0.084;

$(document).ready(function (){
	takeCareOfValidators();
	takeCareOfFields();

    setCookie();
    $('#GoAsync').click(function() {
        var dataObject;
    	options = getOptions();
    	if (options.get("firstFile")) {
    	    console.log("first")
            var fileReader = new FileReader();
            fileReader.readAsText(options.get("firstFile"));
            fileReader.onloadend = function() {
                buildGeneTree({newick: fileReader.result.trim()});
            }
    	} else if (options.get("firstFileArea")) {
            console.log("second")
    	    buildGeneTree({newick: options.get("firstFileArea")});
    	}
    });

});

function buildGeneTree(dataObject) {
    phylocanvas = new Smits.PhyloCanvas(
        dataObject,
        'svgContainer',
        1500, 1300
    );
    var processed = false;
    var textCounter = 0;
    // first we count the number of leaves
    d3.select('#svgContainer>svg').selectAll('*')
        .attr("dummy", function() {
            // a) we check 'processed' because text() gives text for actual 'text' and 'tspan' tag
            // which is inside 'text' tag
            // b) we check 'textCounter++ > 0' because the first text is a text from rafael package
            // c) we check 'isNaN(d3.select(this).text())' because if it's a number then this is bootstrap value
            if (d3.select(this).text().length && isNaN(d3.select(this).text()) && !processed && textCounter++ > 0)
                processed = true;
            else
                processed = false;
        });

    // after that we remove the built tree, in order to build a new one with the corrected height
    // 1300 and 21 are empirically deduced values
    d3.select('#svgContainer>svg').remove();
    phylocanvas = new Smits.PhyloCanvas(
        dataObject,
        'svgContainer',
        1500, 1300*textCounter/21
    );

    processed = false;
    textCounter = 0;
    var refSeqsAndYCoords = {};
    var refSeqs = [];
    var longestXCoord = 0;
    var longestXCoordText;
    d3.select('#svgContainer>svg').selectAll('*')
        .attr("dummy", function(){
            if (d3.select(this).text().length && isNaN(d3.select(this).text()) && !processed && textCounter++ > 0) {
                var yCoord = +d3.select(this).attr('y');
                var xCoord = +d3.select(this).attr('x');
                var text = d3.select(this).text().split("_").slice(0, 2).join("_");
                refSeqsAndYCoords[text] = yCoord-yShiftOfClusterRegardingLeafeYCoord;
                refSeqs.push(text);
                if (xCoord > longestXCoord) {
                    longestXCoord = xCoord;
                    longestXCoordText = d3.select(this).text();
                }
                processed = true;
            } else
                processed = false;
        });

    getGenesAndDraw(refSeqs, refSeqsAndYCoords, longestXCoord, longestXCoordText);
}

function setCookie() {
    typeof Cookies.get('protoTree') == 'undefined'
        ? Cookies.set('protoTree', ''+Math.random(), { expires: 1 })
        : null;
}

function getGenesAndDraw(refSeqs, refSeqsAndYCoords, xCoordinate, xCoordinateText) {
    xCoordinate = xCoordinate + xCoordinateText.length*6.5;
    var refSeqCounter = 0;

    function getFetchSettings(gene, type) {
        var geneUrl = `https://api.mistdb.caltech.edu/v1/genes?search=${gene}`;
        var geneNeighborsUrl = `https://api.mistdb.caltech.edu/v1/genes/${gene}/neighbors`;
        var geneFetchSettings = {
            "async": true,
            "crossDomain": true,
            "url": "https://api.mistdb.caltech.edu/v1/genes/GCF_000302455.1-A994_RS01985",
            "method": "GET",
            "headers": {}
        };
        geneFetchSettings.url = type === "neighbors" ? geneNeighborsUrl : geneUrl;
        return geneFetchSettings;
    }

    // don't show while not all neoghbor genes are loaded
    //$('#svgContainer').hide();
    fetchGene(refSeqs[0], refSeqCounter);
    //recursive function
    function fetchGene(refSeq, refSeqCounter) {
        $.ajax(getFetchSettings(refSeq)).done(function (gene) {
            console.log(refSeqCounter)
            fetchNeighborGenes(gene, refSeqsAndYCoords, xCoordinate, refSeq, refSeqs, refSeqCounter);
        }).fail(function(jqXHR, textStatus, errorThrown) {
            fetchNext(refSeqs, refSeqCounter);
        });
    }

    function fetchNeighborGenes(gene, refSeqsAndYCoords, xCoordinate, refSeq, refSeqs, refSeqCounter) {
        if (gene[0]) {
            $.ajax(getFetchSettings(gene[0].stable_id, "neighbors")).done(function (neighbGenes) {
                console.log(refSeqCounter + " +++++++++++++++++++++ ")
                drawNeighborGenes(d3.select('#svgContainer>svg'), gene[0], neighbGenes, refSeqsAndYCoords[refSeq], xCoordinate);
                fetchNext(refSeqs, refSeqCounter);
            }).fail(function(jqXHR, textStatus, errorThrown) {
                fetchNext(refSeqs, refSeqCounter);
            });
        } else
            fetchNext(refSeqs, refSeqCounter);
    }

    function fetchNext(refSeqs, refSeqCounter) {
        console.log(refSeqCounter + " -------------------------")
        if (++refSeqCounter < refSeqs.length)
            fetchGene(refSeqs[refSeqCounter], refSeqCounter);
        else {
            //$('#svgContainer').show();
            console.log($("#svgContainer>svg")[0]);
        }

    }
}

function drawNeighborGenes(domElement, gene, neighbGenes, yCoordinate, xCoordinate) {
    var clusterPictureWidth = svgWidth - 0.19*svgWidth;
    var span = neighbGenes[neighbGenes.length-1].stop - neighbGenes[0].start;
    var genomeNeighbStart = neighbGenes[0].start - span*clusterOffsetLeft;
    var genomeNeighbStop = neighbGenes[neighbGenes.length-1].stop + span*clusterOffsetRight;
    var lastGeneStop = neighbGenes[neighbGenes.length-1].stop;
    var geneScale = d3.scaleLinear()
        .domain([genomeNeighbStart, genomeNeighbStop])
        .range([4, clusterPictureWidth-5]);

    var containerGroup = domElement.append("g")
        .attr("transform", `translate(${xCoordinate}, ${yCoordinate})`);
    var	geneCluster = createFrameAndAppendGroupTags(containerGroup, [...neighbGenes, gene], clusterPictureWidth);
    createGenePaths(geneCluster, gene, geneScale);
    containerGroup.append("g").attr("class", "gene-axis-identifier-"+gene.id)
        .attr("transform", `translate(0, ${axisYTranslation})`)
        .attr("color", "#e6e6e6")
        .call(d3.axisBottom(geneScale).tickValues([]));
    createDescriptionBoxes(geneCluster, geneScale, span, gene.id);
    var divs = addHtml([...neighbGenes, gene], d3.select('#svgContainer'));
    addEventListeneres(geneCluster, geneScale);
    addHtmlEventListeneres(divs, geneScale);
}

function createFrameAndAppendGroupTags(containerGroup, neighbourGenes, clusterPictureWidth) {
    var clusterFrameWidth = clusterPictureWidth;
    containerGroup.insert("rect")
        .attr("transform", "translate(0,0)")
        .attr("fill-opacity", "0.00")
        .attr("stroke", "#d9d9d9")
        .attr("stroke-width", 2)
        .attr("rx", frameRectXRadius)
        .attr("ry", frameRectYRadius)
        .attr('width', clusterFrameWidth)
        .attr('height', clusterFrameHeight);

    return containerGroup.selectAll("g")
        .data(neighbourGenes)
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "gene"+d.id+" gene-div "+"identifier-"+neighbourGenes[neighbourGenes.length-1].id;
        })
        .attr("transform", function(d) {
            return "translate(0, 0)";
        });
}

function createGenePaths(geneCluster, thisgene, geneScale) {
    var genePath;
    geneCluster.append("path")
        .attr("d", function(gene, i) {
            var isComplement = gene.strand === "-" ? true : false;
            if (!isComplement) {
                genePath = [
                    `M${geneScale(gene.start)}`, directGeneFigureTopY,
                    `L${geneScale(gene.stop)-geneFigureArrowLen}`, directGeneFigureTopY,
                    `L${geneScale(gene.stop)}`, directGeneFigureMiddlePointY,
                    `L${geneScale(gene.stop)-geneFigureArrowLen}`, directGeneFigureBottomY,
                    `L${geneScale(gene.start)}`, directGeneFigureBottomY, 'Z'
                ].join(" ");
            } else {
                genePath = [
                    `M${geneScale(gene.start)}`, reverseGeneFigureMiddlePointY,
                    `L${geneScale(gene.start)+geneFigureArrowLen}`, reverseGeneFigureTopY,
                    `L${geneScale(gene.stop)}`, reverseGeneFigureTopY,
                    `L${geneScale(gene.stop)}`, reverseGeneFigureBottomY,
                    `L${geneScale(gene.start)+geneFigureArrowLen}`, reverseGeneFigureBottomY, 'Z'
                ].join(" ");
            }
            return genePath;
        })
        .attr("fill", function(gene){
            if (gene.stable_id === thisgene.stable_id)
                return currentGeneColour;
            return fillColour;
        })
        .attr("stroke", function() {
            return borderColour;
        })
        .attr("class", "gene-path");
}


function addHtml(neighbourGenes, d3ParentElement) {
    return d3ParentElement
        .data(["", ...neighbourGenes])
        .enter()
        .append('div')
        .style("display", "none")
        .style("position", "absolute")
        .attr("class", function(gene) {
            return "gene"+gene.id+" gene-div "+"identifier-"+neighbourGenes[neighbourGenes.length-1].id;
        })
        .html(function(gene) {
            var format = gene.strand === "-" ? "complement(coords)" : "(coords)";
            var geneCoordinates = format.replace("coords", gene.start + ".." + gene.stop);
            return `<div><a href="/genes/${gene.stable_id}">${gene.stable_id}</a></div>` +
                `<div>${gene.version}</div><div>${geneCoordinates}</div>` +
                `<div>${gene.product}<div/>`;
        });
}

function createDescriptionBoxes(geneCluster, geneScale, span, mainGeneId) {
    geneCluster.append("rect")
        .style("display", "none")
        .attr("class", function(d) {
            return "gene"+d.id+" gene-div "+"identifier-"+mainGeneId;
        })
        .attr('width', infoBoxWidth)
        .attr('height', infoBoxHeight)
        .attr("fill-opacity", "1")
        .attr("fill", "white")
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .attr("rx", infoBoxRectXRadius)
        .attr("ry", infoBoxRectYRadius)
        .attr("x", function(gene, ind) {
            var boxXCoord = gene.start - span*xShiftLeft;
            if (ind === geneCluster.size()-2)
                boxXCoord = gene.start - span*xShiftLeftLast;
            return geneScale(boxXCoord);
        })
        .attr("y", function(gene) {
            var isComplement = gene.strand === "-" ? true : false;
            if (!isComplement)
                return directGeneInfoBoxY;
            return reverseGeneInfoBoxY;
        });
}

function addEventListeneres(geneCluster, geneScale) {
    geneCluster
    .on("mouseover", function (){
        var element = d3.select(this);
        var mainGeneIdentifier = element.attr("class").split(" ")[2];
        var axisElem = document.getElementsByClassName('gene-axis-'+mainGeneIdentifier)[0].getBoundingClientRect();
        console.log('document ' + document.getElementsByClassName('gene-axis-'+mainGeneIdentifier)[0])
        var textPositionFactorXMain;
        var top, left, xAbsolute = axisElem["x"] + window.scrollX, yAbsolute = axisElem["y"] + window.scrollY;
        console.log('yAbsolute ' + yAbsolute)
        element.attr("dummy", function(gene){
            let isComplement = gene.strand === "-" ? true : false;
            if (!isComplement)
                top = yAbsolute - textPositionFactorDirectY + "px;";
            else top = yAbsolute - textPositionFactorReverseY + "px;";
            if (gene.stop === lastGeneStop) {
                textPositionFactorXMain = textPositionFactorXLast;
            }
            else
                textPositionFactorXMain = textPositionFactorX;
            left = geneScale(gene.start) + xAbsolute + textPositionFactorXMain + "px;";
        });

        var elementsOfTheClass = document.getElementsByClassName(element.attr("class"));
        var textDiv = elementsOfTheClass[2];
        var textDivStyles = textDiv.getAttribute("style").replace("display: none","display: inline");

        var regTop = /top: \d+.+px;/;
        var regLeft = /left: \d+.+px;/;
        regTop.test(textDivStyles)
            ? textDivStyles = textDivStyles.replace(regTop, "top: " + top)
            : textDivStyles = textDivStyles + "top: " + top;

        regLeft.test(textDivStyles)
            ? textDivStyles = textDivStyles.replace(regLeft, "left: " + left)
            : textDivStyles = textDivStyles + "left: " + left;
        textDiv.setAttribute("style", textDivStyles);
        var descripRect = elementsOfTheClass[1];
        var descripRectStyles = descripRect.getAttribute("style").replace("display: none","display: inline");
        descripRect.setAttribute("style", descripRectStyles);

        element.raise();
    })
    .on("mouseout", function(){
        var element = d3.select(this);
        var elementsOfTheClass = document.getElementsByClassName(element.attr("class"));

        var textDiv = elementsOfTheClass[2];
        var textDivStyles = textDiv.getAttribute("style").replace("display: inline","display: none");
        textDiv.setAttribute("style", textDivStyles);

        var descripRect = elementsOfTheClass[1];
        var descripRectStyles = descripRect.getAttribute("style").replace("display: inline","display: none");
        descripRect.setAttribute("style", descripRectStyles);
    });
}

function addHtmlEventListeneres(divs, geneScale) {
    divs
    .on("mouseover", function () {
        var element = d3.select(this);
        var mainGeneIdentifier = element.attr("class").split(" ")[2];
        var axisElem = document.getElementsByClassName('gene-axis-'+mainGeneIdentifier)[0].getBoundingClientRect();
        var xAbsolute = axisElem["x"] + window.scrollX, yAbsolute = axisElem["y"] + window.scrollY;
        var textPositionFactorXMain;
        element
            .style("top", function(gene) {
                var isComplement = gene.strand === "-" ? true : false;
                if (!isComplement)
                    return yAbsolute - textPositionFactorDirectY + "px";
                return yAbsolute - textPositionFactorReverseY + "px";

            })
            .style("left", function(gene) {
                if (gene.stop === lastGeneStop)
                    textPositionFactorXMain = textPositionFactorXLast;
                else
                    textPositionFactorXMain = textPositionFactorX;
                return geneScale(gene.start) + xAbsolute + textPositionFactorXMain + "px";
            })
            .style("display", "inline");

        var elementsOfTheClass = document.getElementsByClassName(element.attr("class"));
        var descripRect = elementsOfTheClass[1];
        var descripRectStyles = descripRect.getAttribute("style").replace("display: none","display: inline");
        descripRect.setAttribute("style", descripRectStyles);
        element.raise();
    })
    .on("mouseout", function(){
        var element = d3.select(this);
        element.style("display", "none");

        var elementsOfTheClass = document.getElementsByClassName(element.attr("class"));
        var descripRect = elementsOfTheClass[1];
        var descripRectStyles = descripRect.getAttribute("style").replace("display: inline","display: none");
        descripRect.setAttribute("style", descripRectStyles);
    });
}