class TaskQueue{
    constructor(concurency){
        this.concurency = concurency;
        this.running = 0;
        this.queue = []
    }
    pushTask(task){
        this.queue.push(task);
        this.next();
    }
    next(){
        while(this.concurency > this.running && this.queue.length){
            const task = this.queue.shift();
            task(()=>{
                this.running--;
                this.next();
            });
            this.running++
        }
    }
}
module.exports = TaskQueue;
