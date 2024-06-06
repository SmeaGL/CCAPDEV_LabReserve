document.addEventListener('DOMContentLoaded', () => {
    const roomForm = document.getElementById('roomForm');
    const roomList = document.getElementById('roomList');
    let rooms = [];
    let editingRoomIndex = -1;

    roomForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const roomName = document.getElementById('roomName').value;
        const timeSlot = document.getElementById('timeSlot').value;
        const studentName = document.getElementById('studentName').value;

        if (editingRoomIndex == -1) {
            rooms.push({ name: roomName, time: timeSlot, studentName: studentName});
        } else {
            rooms[editingRoomIndex] = { name: roomName, time: timeSlot, studentName: studentName };
            editingRoomIndex = -1;
        }

        roomForm.reset();
        renderRooms();
    });

    function renderRooms() {
        roomList.innerHTML = '';
        rooms.forEach((room, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${room.name} - ${room.time}  - ${room.studentName}</span>
                <div class="actions">
                    <button onclick="editRoom(${index})">Edit</button>
                    <button onclick="deleteRoom(${index})">Delete</button>
                </div>
            `;
            roomList.appendChild(li);
        });
    }

    editRoom = function(index) {
        document.getElementById('roomName').value = rooms[index].name;
        document.getElementById('timeSlot').value = rooms[index].time;
        document.getElementById('studentName').value = rooms[index].studentName;
        editingRoomIndex = index;
    };

    deleteRoom = function(index) {
        rooms.splice(index, 1);
        renderRooms();
    };
});
