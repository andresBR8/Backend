import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('/tasks')
export class TaskController {

    constructor(private tasksService:TasksService) { }


    @ApiTags('tasks')
    @Get()
    getAllTasks(@Query() query: any) {
        console.log(query);
        return this.tasksService.getTasks();
    }
    @Get('/:id')
    getTask(@Param('id') id: string) {
        return this.tasksService.getTask(parseInt(id));
    }
    @Post()
    createTasks(@Body() task: CreateTaskDto) {
        return this.tasksService.createTask(task);
    }
    @Put()
    updateTasks(@Body() task: UpdateTaskDto) {
        return this.tasksService.updateTask(task);
    }
    @Delete()
    deleteTasks() {
        return this.tasksService.deleteTask();
    }

    @Patch()
    updateTasksStatus() {
        return this.tasksService.updateTaskStatus();
    }
}