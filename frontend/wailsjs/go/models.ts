export namespace main {
	
	export class Option {
	    key: string;
	    text: string;
	    image?: string;
	
	    static createFrom(source: any = {}) {
	        return new Option(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.key = source["key"];
	        this.text = source["text"];
	        this.image = source["image"];
	    }
	}
	export class Question {
	    number: number;
	    orig_number: number;
	    type: string;
	    question_text: string;
	    images: string[];
	    options: Option[];
	    correct_answers: string[];
	    explanation: string;
	
	    static createFrom(source: any = {}) {
	        return new Question(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.orig_number = source["orig_number"];
	        this.type = source["type"];
	        this.question_text = source["question_text"];
	        this.images = source["images"];
	        this.options = this.convertValues(source["options"], Option);
	        this.correct_answers = source["correct_answers"];
	        this.explanation = source["explanation"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ExamData {
	    exam_title: string;
	    total_questions: number;
	    passing_score_percentage: number;
	    time_limit_minutes: number;
	    questions: Question[];
	
	    static createFrom(source: any = {}) {
	        return new ExamData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.exam_title = source["exam_title"];
	        this.total_questions = source["total_questions"];
	        this.passing_score_percentage = source["passing_score_percentage"];
	        this.time_limit_minutes = source["time_limit_minutes"];
	        this.questions = this.convertValues(source["questions"], Question);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class QuestionResultDetail {
	    number: number;
	    user_answers: string[];
	    correct_answers: string[];
	    is_correct: boolean;
	
	    static createFrom(source: any = {}) {
	        return new QuestionResultDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.number = source["number"];
	        this.user_answers = source["user_answers"];
	        this.correct_answers = source["correct_answers"];
	        this.is_correct = source["is_correct"];
	    }
	}
	export class ExamResult {
	    total_questions: number;
	    correct_count: number;
	    score_percentage: number;
	    is_passed: boolean;
	    details: QuestionResultDetail[];
	
	    static createFrom(source: any = {}) {
	        return new ExamResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.total_questions = source["total_questions"];
	        this.correct_count = source["correct_count"];
	        this.score_percentage = source["score_percentage"];
	        this.is_passed = source["is_passed"];
	        this.details = this.convertValues(source["details"], QuestionResultDetail);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	
	export class Submission {
	    answers: Record<number, Array<string>>;
	
	    static createFrom(source: any = {}) {
	        return new Submission(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.answers = source["answers"];
	    }
	}

}

