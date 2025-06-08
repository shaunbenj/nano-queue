Simple Queue that follows SQS in design written from scratch. This repo consists of two services a queue service and an in-memory database that the queue service uses. 

# Queue Service
Example usage:
1. Start the service up by running `npm run all`
2. Create your queue
![image](https://github.com/user-attachments/assets/c5f19d5e-4df3-4037-bfd9-f8484b1de5f2)
3. Push an item onto your queue. It will return an ID back for your item if successful and mark the item as invisible for 30s.
![image](https://github.com/user-attachments/assets/cf13e2e9-c8d6-457c-b1a1-3b2712e3a4aa)
4. Attempting to pop again will return back no items
![image](https://github.com/user-attachments/assets/7b2966fc-5dfc-4ec3-af50-819c514aa584)
5. Once 30s has passed the [retry worker](https://github.com/shaunbenj/nano-queue/blob/main/app/services/queue/retry_worker.js) will move the item back onto the queue
![image](https://github.com/user-attachments/assets/9a88a06f-2185-4d9d-9c6f-7510b7ee452c)
6. After the popping the item again you can then delete the item from the queue. Note attempting to delete the item while it is on the queue will fail.

![image](https://github.com/user-attachments/assets/b1885a63-0a55-44df-867a-33e5dac7e949)
![image](https://github.com/user-attachments/assets/c195a1a5-5da2-4ef5-83c5-6f5ca2bf7429)

# MemDB
MemDB, the in-memory database, is its own fully fledged database. It allows you to execute scripts using Lua via [wasmoon](https://github.com/ceifa/wasmoon) with rollback capabilites. It supports a KeyValue, SortedSet and Queue data stores.

Example usage:
1. Create a KeyValue datastructure and populate it with myKey => myValue
![image](https://github.com/user-attachments/assets/73d869e8-6def-49d6-b4aa-e4b50783b4ae)
2. Set myKey to myValue2 and then execute incorrect Lua code. This will result in the set being rolled back and the original value being restored. 
![image](https://github.com/user-attachments/assets/bcd20364-62ed-4963-a9a6-287e2aff3e72)
3. Querying for the key will return the original value
![image](https://github.com/user-attachments/assets/e7984133-f386-4fd4-9f82-ee5c36fca2ca)

Rollback works by appending a series of undocommands while executing a script. When the execution raises an error the undo commands are executed to rewind the database back to its original state see [here](https://github.com/shaunbenj/nano-queue/blob/main/app/services/mem_db/script_executor.js#L87-L103). [Mutexes](https://github.com/shaunbenj/nano-queue/blob/main/app/services/mem_db/script_executor.js#L73-L74) are used to ensure isolation and atomicity.


