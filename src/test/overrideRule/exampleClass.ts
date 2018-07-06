namespace override {

    export class ExampleClass extends BaseClass {
        
        /**
         * Override decorator required.
         */
        @override public baseProperty = "Example";
        
        /**
         * Decorator not required.
         */
        protected exampleProperty = "Example";

        
        /**
         * Override decorator required.
         */
        @override public baseMethodOne() {
            /// noop
        }
        
        
        /**
         * Public method should force override decorator for any implementations
         */
        public exampleMethodOne() {
            /// noop
        }
        
        /**
         * Protected method should force override decorator for any implementations
         */
        protected exampleMethodTwo() {
            /// noop
        }
        
        /**
         * Protected method should force override decorator for any implementations
         */
        protected exampleMethodThree() {
            /// noop
        }
    }

}
