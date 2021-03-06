class Point {
	constructor(X, Y, size, color) {
		this.X = X;
		this.Y = Y;
		this.size = size;
		this.color = color;
	}
	draw() {
		var ctx = appView.context;
		ctx.fillStyle = this.color;
		ctx.fillRect(
			(this.X - this.size / 2) * appView.screenRatio()[0],
			(this.Y - this.size / 2) * appView.screenRatio()[1],
			this.size * appView.screenRatio()[0],
			this.size * appView.screenRatio()[1]
		);
	}
}
class Segment {
    constructor(AX, AY, BX, BY){
        this.AX = AX;
        this.BX = BX;
        this.AY = AY;
        this.BY = BY;
    }
}
function det(a, b, c, d) {
    /* 2x2 determinant */
    return (a*d - b*c);
}

function onSegment(P, Q, R){
    /* Checks whether point Q is on the segment PR (P,Q,R colinear) */
    return (Q.X <= Math.max(P.X, R.X) && Q.X >= Math.min(P.X, R.X) &&
        Q.Y <= Math.max(P.Y, R.Y) && Q.Y >= Math.min(P.Y, R.Y));
}
function pointsIntersect(A1,A2,A3,A4){
    /* Checks whether 2 A1A2 and A3A4 intersect */
    /* Return values:
        (X, Y) - points of intersection
        (undefined, 0) - segments do not intersect
        TODO: (undefined,undefined) - segments are parallel */
    let a1 = (A2.Y - A1.Y);
    let b1 = -(A2.X - A1.X);
    let c1 = A1.Y*(A2.X-A1.X) - A1.X*(A2.Y-A1.Y);

    let a2 = (A4.Y - A3.Y);
    let b2 = -(A4.X - A3.X);
    let c2 = A3.Y*(A4.X-A3.X) - A3.X*(A4.Y-A3.Y);

    if( det(a1,b1,a2,b2) ) {
        XY = new Point;
        XY.X = det(-c1, b1, -c2, b2)/det(a1,b1,a2,b2);
        XY.Y = det(a1, -c1, a2, -c2)/det(a1,b1,a2,b2);
        if(onSegment(A1, XY, A2) && onSegment(A3,XY,A4)){
            return {
                    X: XY.X,
                    Y: XY.Y
                }        
        } else {
            return {
                X: -1,
                Y: 0
            }
        }
	} else {
		return {
			X: -1,
			Y: -1
		}
}
}
//////////////////////////////////////////////////////////////////
class Polygon {
	constructor(points = [], color = "#FF0000") {
		this.points = points;
		this.color = color;
	}
	addPoint(p) {
		this.points.push(p);
		console.log("Added point " + p.X + ", " + p.Y + " to polygon");
	}
	removePoint(p) {
		console.log("Removed point " + p.X + ", " + p.Y + " to polygon");
		this.points.splice(
			this.points.indexOf(p), 1
		);
	}
	draw() {
		if(!this.points[0]) return;
		var ctx = appView.context;
		ctx.beginPath();
		ctx.strokeStyle = this.color;
		ctx.moveTo(
			appView.screenRatio()[0] * this.points[0].X,
			appView.screenRatio()[1] * this.points[0].Y
		);
		for(let i = 0; i < this.points.length; i++) {
			ctx.lineWidth = 10;
			ctx.lineTo(
				appView.screenRatio()[0] * this.points[i].X,
				appView.screenRatio()[1] * this.points[i].Y
			);
			ctx.lineWidth = 2;
			ctx.lineTo(
				appView.screenRatio()[0] * this.points[i].X,
				appView.screenRatio()[1] * this.points[i].Y
			);
		}
		ctx.stroke();
	}
}

function distance(a, b){
    return Math.sqrt((b.X - a.X)*(b.X - a.X) + (b.Y - a.Y)*(b.Y - a.Y));
}

function findClosestIntersection(Poly, camera){
	/* Finds the closest intersection of the rays and the segments */
    /* Input:
		Poly - A polygon type object.
		camera- A point type object.
	/* Return values:
		 intersections - An array of type Points objects.

		*/
	var intersections=[];
    var segments = [];
    var raysegments = [];
	//Constrcting segments from the points of Polygon//
    for(let i=0;i<Poly.points.length-1;i++){
        seg = new Segment;
        seg.AX = Poly.points[i].X;
        seg.AY = Poly.points[i].Y;
        seg.BX = Poly.points[i+1].X;
        seg.BY = Poly.points[i+1].Y;
        segments.push(seg);
    }
    seg = new Segment;
    seg.AX = Poly.points[0].X;
    seg.AY = Poly.points[0].Y;
    seg.BX = Poly.points[Poly.points.length-1].X;
    seg.BY = Poly.points[Poly.points.length-1].Y;
    segments.push(seg);
	//console.log(segments);
	//-----------------------------------------------//
	
	//Constructing  rays from the camera point to all the points of the Polygon//
    for(let i=0;i<Poly.points.length;i++){ 
        seg = new Segment;
        seg.AX = camera.X;
        seg.AY = camera.Y;
        seg.BX = Poly.points[i].X;
        seg.BY = Poly.points[i].Y;
        raysegments.push(seg);
		
		var panta=(seg.BY-seg.AY)/(seg.BX-seg.AX);
		var panta_1= panta+0.0001;
		var panta_2= panta-0.0001;
		
		if(seg.AY<seg.BY)
		{
			var point_poz=(100-seg.AY+seg.AX*panta_1)/panta_1;
			var point_neg=(100-seg.AY+seg.AX*panta_2)/panta_2;
			var seg_poz=new Segment(seg.AX,seg.AY,point_poz,100);
			var seg_neg=new Segment(seg.AX,seg.AY,point_neg,100);
			raysegments.push(seg_poz);
			raysegments.push(seg_neg);
		}
		else
		{
			var point_poz=(0-seg.AY+seg.AX*panta_1)/panta_1;
			var point_neg=(0-seg.AY+seg.AX*panta_2)/panta_2;
			var seg_poz=new Segment(seg.AX,seg.AY,point_poz,0);
			var seg_neg=new Segment(seg.AX,seg.AY,point_neg,0);
			raysegments.push(seg_poz);
			raysegments.push(seg_neg);
		}
		
    }
	//-------------------------------------------------------------------------//
	//console.log(raysegments);
	console.log(segments.length);
	console.log(raysegments.length);
	//For every ray segment check every Polygon segment if they intersect and find the closest points //
    for(let i=0; i<raysegments.length;i++){
        let x1 = new Point;
        let x2 = new Point;
        x1.X = raysegments[i].AX;
        x1.Y = raysegments[i].AY;
        x2.X = raysegments[i].BX;
        x2.Y = raysegments[i].BY;
        rez = new Point(999,999,0,4);

        for(let j=0; j<segments.length;j++){
            let x3 = new Point;
            let x4 = new Point;
            x3.X = segments[j].AX;
            x3.Y = segments[j].AY;
            x4.X = segments[j].BX;
            x4.Y = segments[j].BY;

            				console.log(pointsIntersect(x1,x2,x3,x4));

            if(pointsIntersect(x1,x2,x3,x4).X!=-1){
                if(distance(pointsIntersect(x1,x2,x3,x4),camera) < distance(rez,camera)){
                    rez = pointsIntersect(x1,x2,x3,x4);
                }
            }
        }
        intersections.push(rez);
    }
	intersections.sort(function(a,b){return a.X - b.X});
    return intersections;
	//-------------------------------------------------------------------------------------------------//
}



window.onload = function() {
    a1 = new Point(1,1,0,4);
    a2 = new Point(3,1,0,4);
    a3 = new Point(5,2,0,4);
    a4 = new Point(3,3,0,4);
    a5 = new Point(5,4,0,4);
    a6 = new Point(1,6,0,4);
	a7 = new Point(1,1,0,4);

	var p=[];
	p.push(a1);
	p.push(a2);
	p.push(a3);
	p.push(a4);
    p.push(a5);
    p.push(a6);
	p.push(a7);
    pol=new Polygon(p,4);
	cam=new Point(4,4,0,0);
    console.log(findClosestIntersection(pol,cam));
}