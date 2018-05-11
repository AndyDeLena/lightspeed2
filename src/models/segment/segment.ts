export class Segment {

    color: string;
    direction: string;
    startAt: string;
    distance: string;
    speed: number;
    unit: string;
    summary: string;
    colorUrl: string;

    constructor(color, direction, startAt, distance, speed, unit) {
        this.color = color;
        this.direction = direction;
        this.startAt = startAt;
        this.distance = distance;
        this.speed = speed;
        this.unit = unit;
        this.colorUrl = 'assets/imgs/colors/' + color.toLowerCase() + '.png';
    }

    createSummary(): string {
        this.summary = '';
        this.summary += this.distance.substring(0, this.distance.indexOf(" ")) + ' yd';
        this.summary += ' in ' + this.speed;
        this.summary += ' ' + (this.unit == 'sec' ? 'sec' : 'mph');
        this.summary += '; ' + (this.direction == 'Forward' ? 'fwd' : 'bwd');
        this.summary += ' from ' + this.startAt.toLowerCase();

        return this.summary;
    }
}